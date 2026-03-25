import { useState, useEffect, useCallback } from 'react';
import { syncService } from '@/services/syncService';
import { SyncState, HeroConflict } from '@/types';

export const useSync = () => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());

  useEffect(() => {
    return syncService.subscribe(setSyncState);
  }, []);

  const syncNow = useCallback(() => {
    syncService.syncNow();
  }, []);

  const resolveConflicts = useCallback((resolutions: Map<string, 'local' | 'remote'>) => {
    syncService.resolveConflicts(resolutions);
  }, []);

  const cancelConflicts = useCallback(() => {
    syncService.cancelConflicts();
  }, []);

  return {
    isSyncing: syncState.isSyncing,
    lastSyncedAt: syncState.lastSyncedAt,
    syncError: syncState.error,
    conflicts: syncState.conflicts,
    syncNow,
    resolveConflicts,
    cancelConflicts,
  };
};
