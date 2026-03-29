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
    pendingRestoreCount: 0,
    autoShowRestores: false,
  };

  async init(userId: string) {
    this.userId = userId;

    // Wait for store to finish loading from AsyncStorage before reading state
    if (!useHeroStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        const unsub = useHeroStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });
    }

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
    this.updateState({ isSyncing: false, lastSyncedAt: null, error: null, conflicts: [], pendingRestoreCount: 0, autoShowRestores: false });
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
    this.updateState({ conflicts: [], pendingRestoreCount: 0, autoShowRestores: false });
  }

  // Called by UI when user taps "Restore from Cloud" button on empty state
  showPendingRestores() {
    if (!this.pendingSync || this.pendingSync.conflicts.length === 0) return;
    this.updateState({ conflicts: this.pendingSync.conflicts, pendingRestoreCount: 0 });
  }

  // Called by UI to fetch and show restorable heroes from cloud
  async fetchRestorableHeroes(): Promise<boolean> {
    if (!this.userId || !this.isOnline) return false;

    this.updateState({ isSyncing: true, error: null });

    try {
      const { data: remoteRows, error } = await supabase
        .from('heroes')
        .select('*')
        .eq('user_id', this.userId)
        .is('deleted_at', null);

      if (error) throw error;

      const { heroes: localHeroes, deletedHeroIds } = useHeroStore.getState();
      const localIds = new Set(localHeroes.map((h) => h.id));
      const deletedSet = new Set(deletedHeroIds);

      const restoreConflicts: HeroConflict[] = [];
      for (const row of remoteRows ?? []) {
        const heroData = row.data as Hero;
        if (!localIds.has(row.id) || deletedSet.has(row.id)) {
          restoreConflicts.push({
            heroId: row.id,
            heroName: heroData.name,
            local: null,
            remote: heroData,
          });
        }
      }

      if (restoreConflicts.length === 0) {
        this.updateState({ isSyncing: false });
        return false;
      }

      this.pendingSync = {
        mergedHeroes: [...localHeroes.filter((h) => !deletedSet.has(h.id))],
        toPush: [],
        conflicts: restoreConflicts,
        deletedHeroIds: [],
      };
      // Don't set active conflicts — store as pending so caller can navigate first
      // and avoid overlapping modal transitions
      this.updateState({ isSyncing: false, pendingRestoreCount: restoreConflicts.length, autoShowRestores: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check cloud';
      this.updateState({ isSyncing: false, error: message });
      return false;
    }
  }

  // Called by UI after user resolves each conflict
  async resolveConflicts(resolutions: Map<string, 'local' | 'remote'>) {
    if (!this.pendingSync) return;

    const { mergedHeroes, toPush, conflicts, deletedHeroIds } = this.pendingSync;

    // Apply user's choices
    for (const conflict of conflicts) {
      const choice = resolutions.get(conflict.heroId);
      if (conflict.local === null) {
        // Deletion conflict: hero was deleted locally but exists in cloud
        if (choice === 'remote') {
          // Restore from cloud
          mergedHeroes.push(conflict.remote);
        } else {
          // Confirm deletion — soft-delete from cloud
          deletedHeroIds.push(conflict.heroId);
        }
      } else if (choice === 'local') {
        mergedHeroes.push(conflict.local);
        toPush.push(conflict.local);
      } else {
        // 'remote' or default to remote
        mergedHeroes.push(conflict.remote);
      }
    }

    // Clear conflicts and pending state IMMEDIATELY before async work
    // so the ConflictResolver modal doesn't reopen from stale state
    this.pendingSync = null;
    this.updateState({ conflicts: [], pendingRestoreCount: 0, autoShowRestores: false });
    try {
      await this.finalizeSyncMerge(mergedHeroes, toPush, deletedHeroIds);
    } catch {
      // finalizeSyncMerge has its own error handling
    }
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
      // Track which deleted IDs are safe to propagate (no cloud version exists)
      const confirmedDeletes: string[] = [];

      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

      // Fresh device with cloud heroes: store as pending restores (don't auto-show)
      if (localMap.size === 0 && deletedSet.size === 0 && remoteMap.size > 0) {
        for (const [id, remote] of remoteMap) {
          conflicts.push({
            heroId: id,
            heroName: remote.data.name,
            local: null,
            remote: remote.data,
          });
        }
        this.pendingSync = { mergedHeroes, toPush, conflicts, deletedHeroIds: confirmedDeletes };
        this.updateState({ isSyncing: false, pendingRestoreCount: conflicts.length });
        return;
      }

      for (const id of allIds) {
        const local = localMap.get(id);
        const remote = remoteMap.get(id);

        if (deletedSet.has(id)) {
          if (remote) {
            // Deleted locally but exists in cloud — ask the user
            conflicts.push({
              heroId: id,
              heroName: remote.data.name,
              local: null,
              remote: remote.data,
            });
          }
          // If no remote version, deletion is already complete — nothing to do
          continue;
        }

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
        const editConflicts = conflicts.filter((c) => c.local !== null);
        const restoreConflicts = conflicts.filter((c) => c.local === null);

        this.pendingSync = { mergedHeroes, toPush, conflicts, deletedHeroIds: confirmedDeletes };

        if (editConflicts.length > 0) {
          // Auto-show edit conflicts (include restore conflicts in the same drawer)
          this.updateState({ isSyncing: false, conflicts });
        } else {
          // Restore-only conflicts — don't auto-show, let user trigger via button
          this.updateState({ isSyncing: false, pendingRestoreCount: restoreConflicts.length });
        }
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
