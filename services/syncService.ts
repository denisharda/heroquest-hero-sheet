import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { useHeroStore } from '@/store/heroStore';
import { Hero, HeroConflict, SyncState } from '@/types';

const SYNC_QUEUE_KEY = 'heroquest-sync-queue';
const LAST_SYNCED_KEY = 'heroquest-last-synced';
const DEBOUNCE_MS = 2000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

type SyncListener = (state: SyncState) => void;

// Pending sync data held while waiting for conflict resolution
interface PendingSync {
  mergedHeroes: Hero[];
  toPush: Hero[];
  conflicts: HeroConflict[];
  deletedHeroIds: string[];
}

class SyncService {
  private userId: string | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private unsubscribeNetInfo: (() => void) | null = null;
  private dirtyHeroIds = new Set<string>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isOnline = true;
  private listeners = new Set<SyncListener>();
  private lastKnownUpdatedAt = new Map<string, number>();
  private pendingSync: PendingSync | null = null;

  private state: SyncState = {
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    conflicts: [],
  };

  async init(userId: string) {
    this.userId = userId;

    await this.restoreDirtyQueue();

    const lastSynced = await AsyncStorage.getItem(LAST_SYNCED_KEY);
    if (lastSynced) {
      this.updateState({ lastSyncedAt: parseInt(lastSynced, 10) });
    }

    const { heroes } = useHeroStore.getState();
    for (const hero of heroes) {
      this.lastKnownUpdatedAt.set(hero.id, hero.updatedAt);
    }

    this.unsubscribeStore = useHeroStore.subscribe((newState, prevState) => {
      if (newState.heroes === prevState.heroes) return;

      for (const hero of newState.heroes) {
        const lastKnown = this.lastKnownUpdatedAt.get(hero.id);
        if (lastKnown === undefined || hero.updatedAt > lastKnown) {
          this.dirtyHeroIds.add(hero.id);
          this.lastKnownUpdatedAt.set(hero.id, hero.updatedAt);
        }
      }

      if (this.dirtyHeroIds.size > 0) {
        this.schedulePush();
      }
    });

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected;

      if (wasOffline && this.isOnline && this.dirtyHeroIds.size > 0) {
        this.pushDirtyHeroes();
      }
    });
  }

  destroy() {
    this.unsubscribeStore?.();
    this.unsubscribeNetInfo?.();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.userId = null;
    this.dirtyHeroIds.clear();
    this.lastKnownUpdatedAt.clear();
    this.pendingSync = null;
    this.unsubscribeStore = null;
    this.unsubscribeNetInfo = null;
    this.debounceTimer = null;
    this.updateState({ isSyncing: false, lastSyncedAt: null, error: null, conflicts: [] });
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): SyncState {
    return this.state;
  }

  async syncNow() {
    await this.performFullSync();
  }

  // Called by UI when user cancels conflict resolution (keeps local versions)
  cancelConflicts() {
    if (!this.pendingSync) return;
    this.pendingSync = null;
    this.updateState({ conflicts: [] });
  }

  // Called by UI after user resolves each conflict
  async resolveConflicts(resolutions: Map<string, 'local' | 'remote'>) {
    if (!this.pendingSync) return;

    const { mergedHeroes, toPush, conflicts, deletedHeroIds } = this.pendingSync;

    // Apply user's choices
    for (const conflict of conflicts) {
      const choice = resolutions.get(conflict.heroId);
      if (choice === 'local') {
        mergedHeroes.push(conflict.local);
        toPush.push(conflict.local);
      } else {
        // 'remote' or default to remote
        mergedHeroes.push(conflict.remote);
      }
    }

    // Now finalize the sync
    await this.finalizeSyncMerge(mergedHeroes, toPush, deletedHeroIds);
    this.pendingSync = null;
    this.updateState({ conflicts: [] });
  }

  // --- Full Sync (bidirectional merge) ---

  async performFullSync() {
    if (!this.userId || !this.isOnline) return;

    this.updateState({ isSyncing: true, error: null, conflicts: [] });

    try {
      const { data: remoteRows, error } = await supabase
        .from('heroes')
        .select('*')
        .eq('user_id', this.userId)
        .is('deleted_at', null);

      if (error) throw error;

      const { heroes: localHeroes, deletedHeroIds } = useHeroStore.getState();
      const deletedSet = new Set(deletedHeroIds);

      const localMap = new Map<string, Hero>();
      for (const h of localHeroes) localMap.set(h.id, h);

      const remoteMap = new Map<string, { data: Hero; updated_at: number }>();
      for (const row of remoteRows ?? []) {
        // Supabase returns bigint columns as strings — coerce to number
        remoteMap.set(row.id, { data: row.data as Hero, updated_at: Number(row.updated_at) });
      }

      const mergedHeroes: Hero[] = [];
      const toPush: Hero[] = [];
      const conflicts: HeroConflict[] = [];

      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

      for (const id of allIds) {
        if (deletedSet.has(id)) continue;

        const local = localMap.get(id);
        const remote = remoteMap.get(id);

        if (local && remote) {
          if (local.updatedAt === remote.updated_at) {
            // Same timestamp — same version, no conflict
            mergedHeroes.push(local);
          } else if (local.updatedAt > remote.updated_at) {
            // Local is newer — use local and push to cloud
            mergedHeroes.push(local);
            toPush.push(local);
          } else {
            // Remote is newer — use remote
            mergedHeroes.push(remote.data);
          }
        } else if (local && !remote) {
          mergedHeroes.push(local);
          toPush.push(local);
        } else if (remote && !local) {
          mergedHeroes.push(remote.data);
        }
      }

      if (conflicts.length > 0) {
        // Pause sync — wait for user to resolve conflicts
        this.pendingSync = { mergedHeroes, toPush, conflicts, deletedHeroIds };
        this.updateState({ isSyncing: false, conflicts });
        return;
      }

      // No conflicts — finalize immediately
      await this.finalizeSyncMerge(mergedHeroes, toPush, deletedHeroIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      this.updateState({ isSyncing: false, error: message });
    }
  }

  private async finalizeSyncMerge(mergedHeroes: Hero[], toPush: Hero[], deletedHeroIds: string[]) {
    this.updateState({ isSyncing: true, error: null });

    try {
      for (const hero of toPush) {
        await this.upsertHero(hero);
      }

      for (const deletedId of deletedHeroIds) {
        await this.softDeleteHero(deletedId);
      }

      useHeroStore.getState().mergeHeroes(mergedHeroes);
      useHeroStore.getState().clearDeletedHeroIds();

      this.lastKnownUpdatedAt.clear();
      for (const hero of mergedHeroes) {
        this.lastKnownUpdatedAt.set(hero.id, hero.updatedAt);
      }

      this.dirtyHeroIds.clear();
      await this.persistDirtyQueue();

      const now = Date.now();
      await AsyncStorage.setItem(LAST_SYNCED_KEY, now.toString());
      this.updateState({ isSyncing: false, lastSyncedAt: now, error: null, conflicts: [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      this.updateState({ isSyncing: false, error: message });
    }
  }

  // --- Push dirty heroes (debounced) ---

  private schedulePush() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.persistDirtyQueue();

    this.debounceTimer = setTimeout(() => {
      this.pushDirtyHeroes();
    }, DEBOUNCE_MS);
  }

  private async pushDirtyHeroes() {
    if (!this.userId || !this.isOnline || this.dirtyHeroIds.size === 0) return;

    this.updateState({ isSyncing: true, error: null });

    try {
      const { heroes, deletedHeroIds } = useHeroStore.getState();
      const heroMap = new Map<string, Hero>();
      for (const h of heroes) heroMap.set(h.id, h);

      for (const heroId of this.dirtyHeroIds) {
        const hero = heroMap.get(heroId);
        if (hero) {
          await this.upsertHeroWithRetry(hero);
        }
      }

      for (const deletedId of deletedHeroIds) {
        await this.softDeleteHero(deletedId);
      }
      if (deletedHeroIds.length > 0) {
        useHeroStore.getState().clearDeletedHeroIds();
      }

      this.dirtyHeroIds.clear();
      await this.persistDirtyQueue();

      const now = Date.now();
      await AsyncStorage.setItem(LAST_SYNCED_KEY, now.toString());
      this.updateState({ isSyncing: false, lastSyncedAt: now, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      this.updateState({ isSyncing: false, error: message });
    }
  }

  // --- Supabase operations ---

  private async upsertHero(hero: Hero) {
    if (!this.userId) return;

    const { error } = await supabase.rpc('upsert_hero', {
      p_id: hero.id,
      p_user_id: this.userId,
      p_data: hero,
      p_updated_at: hero.updatedAt,
      p_created_at: hero.createdAt,
    });

    if (error) throw error;
  }

  private async upsertHeroWithRetry(hero: Hero) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await this.upsertHero(hero);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES - 1) throw err;
        const delay = BASE_RETRY_DELAY_MS * Math.pow(4, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  private async softDeleteHero(heroId: string) {
    if (!this.userId) return;

    const { error } = await supabase.rpc('soft_delete_hero', {
      p_id: heroId,
      p_user_id: this.userId,
      p_deleted_at: Date.now(),
    });

    if (error) console.warn('Soft delete failed:', error.message);
  }

  // --- Dirty queue persistence ---

  private async persistDirtyQueue() {
    const ids = Array.from(this.dirtyHeroIds);
    if (ids.length > 0) {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(ids));
    } else {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    }
  }

  private async restoreDirtyQueue() {
    const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (stored) {
      const ids: string[] = JSON.parse(stored);
      for (const id of ids) this.dirtyHeroIds.add(id);
    }
  }

  // --- State management ---

  private updateState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const syncService = new SyncService();
