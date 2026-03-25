# Supabase Auth + Cloud Sync Design

**Date**: 2026-03-25
**Status**: Draft

## Problem

Hero data is stored only in device-local AsyncStorage. Data is lost if the user clears the app, switches phones, or loses their device. There is no way to access heroes from multiple devices.

## Solution

Add Supabase as a cloud backend with authentication (Google, Apple, Email/Password) and a sync service that automatically pushes hero data to a Postgres database. The app remains offline-first: it works without an account and without internet. Cloud sync activates as an opt-in feature after sign-in.

## Architecture

**Service Layer with Explicit Sync**: A standalone `SyncService` subscribes to the Zustand store via `subscribe()` and pushes changes to Supabase. The store has no knowledge of Supabase. Components have no knowledge of sync.

```
components --> useHero --> heroStore (Zustand + AsyncStorage)
                                |
                                v  (store.subscribe)
                           SyncService --> Supabase
```

**Why this approach**: Zero changes to existing store actions. Clean separation of concerns. Sync is testable independently. Natural debouncing for rapid state changes. Easily disabled for anonymous users.

## Database Schema

Single `heroes` table with JSONB document storage. The Hero object is a self-contained document — normalizing equipment, spells, and inventory into separate tables would add join complexity with no benefit for a single-user character sheet.

```sql
create table heroes (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at bigint not null,
  created_at bigint not null,
  deleted_at bigint,
  primary key (user_id, id)
);

create index idx_heroes_user_id on heroes(user_id);
alter table heroes enable row level security;

create policy "Users access own heroes"
  on heroes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Conflict-safe upsert** (last-write-wins by `updatedAt`):

```sql
create or replace function upsert_hero(
  p_id text, p_user_id uuid, p_data jsonb, p_updated_at bigint, p_created_at bigint
) returns void as $$
begin
  insert into heroes (id, user_id, data, updated_at, created_at)
  values (p_id, p_user_id, p_data, p_updated_at, p_created_at)
  on conflict (user_id, id) do update
  set data = p_data, updated_at = p_updated_at
  where heroes.updated_at < p_updated_at;
end;
$$ language plpgsql security definer;
```

**Soft deletes**: A `deleted_at` column (null = active) ensures offline hero deletions propagate correctly during sync, rather than re-downloading "missing" heroes.

**Primary key is `(user_id, id)`**: Hero IDs are scoped per-user, not globally unique. This avoids ID collision issues across devices/accounts.

## Authentication

### Methods
- **Email/Password**: `supabase.auth.signUp()` / `signInWithPassword()`
- **Google**: `expo-auth-session` to get ID token, then `supabase.auth.signInWithIdToken({ provider: 'google', token })`
- **Apple**: `expo-apple-authentication` to get ID token, then `supabase.auth.signInWithIdToken({ provider: 'apple', token })`

### Email Verification
Disable email confirmation in Supabase dashboard (Auth > Settings) for simplicity. Users can sign in immediately after sign-up.

### Platforms
iOS + Android only (no web auth).

### Session Persistence
The Supabase client must be configured with `storage: AsyncStorage` so auth sessions survive app restarts. The client config includes `autoRefreshToken: true` and `detectSessionInUrl: false` (critical for React Native — no URL-based auth).

### Flow
- App works immediately without sign-in (local AsyncStorage, same as today)
- Profile icon in header bar opens auth screen
- After sign-in: SyncService initializes, full sync runs, ongoing sync enabled
- After sign-out: SyncService destroyed, local hero data is preserved (user keeps their local heroes)

### First Sign-In Migration
All local heroes are uploaded to the new account. Since the remote has no rows for this user, there are no conflicts.

### Account Deletion (App Store Requirement)
Apple requires apps with account creation to support account deletion. The auth screen (signed-in state) includes a "Delete Account" button that:
1. Calls a Supabase Edge Function or RPC to delete the user (cascades to delete all hero rows via `ON DELETE CASCADE`)
2. Signs the user out locally
3. Local hero data is preserved (reverts to anonymous/local-only mode)

The database function:
```sql
create or replace function delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
```

## Sync Service

### Core Operations

| Operation | Trigger | Description |
|-----------|---------|-------------|
| `init(userId)` | After sign-in | Subscribe to heroStore, start NetInfo listener |
| `destroy()` | On sign-out | Unsubscribe all listeners, clear queue |
| `performFullSync()` | After sign-in, manual trigger | Merge local and remote heroes bidirectionally |
| `pushDirtyHeroes()` | 2s after last hero mutation | Batch upsert changed heroes to Supabase |
| `handleDeletes()` | During push | Set `deleted_at` on remotely-tracked deleted heroes |

### Write Flow
1. User mutates hero via Zustand action
2. Persist middleware writes to AsyncStorage (unchanged)
3. SyncService's `subscribe()` callback fires
4. Changed hero IDs detected by comparing `updatedAt` against a `lastSyncedAt` map (per hero ID) — not reference comparison, which breaks on rehydration
5. IDs added to `dirtyHeroIds` Set
6. After 2-second debounce, `pushDirtyHeroes()` upserts all dirty heroes
7. If offline, queue remains and flushes on reconnect (NetInfo listener)
8. `dirtyHeroIds` is always persisted to AsyncStorage (`heroquest-sync-queue` key) to survive app backgrounding/kills during the debounce window

### Full Sync Algorithm (on sign-in)
1. Fetch all remote heroes where `deleted_at IS NULL`
2. For each hero ID present in both local and remote: keep whichever has higher `updatedAt`
3. Heroes only in local: push to remote
4. Heroes only in remote AND NOT in `deletedHeroIds`: pull to local
5. For each ID in `deletedHeroIds`: set `deleted_at` on remote row (if it exists)
6. Apply merged set atomically: `useHeroStore.setState({ heroes: mergedHeroes, history: [], historyIndex: -1 })`
7. Clear `deletedHeroIds` after successful remote propagation

**Note**: Step 6 resets undo history to avoid stale history entries referencing pre-merge hero objects.

**Note**: Step 4 explicitly excludes heroes in `deletedHeroIds` to prevent re-downloading heroes deleted while offline.

### `currentHeroId` During Full Sync
If the current hero was deleted remotely (from another device), `currentHeroId` is reset to the first available hero or `null` if none remain.

### Conflict Resolution
Last-write-wins using the `updatedAt` epoch timestamp. The Postgres `upsert_hero` function only overwrites if the incoming `updatedAt` exceeds the stored value.

### Offline Resilience
- Online/offline detected via `@react-native-community/netinfo`
- `dirtyHeroIds` persisted to AsyncStorage (`heroquest-sync-queue` key) — mandatory, not optional
- On reconnect, queued changes flush automatically

### Error Handling
- Failed Supabase calls retry with exponential backoff: 3 attempts (2s, 8s, 32s)
- After 3 failures, sync pauses and shows "Sync error" with manual retry option
- If auth token expires mid-session, `supabase.auth.onAuthStateChange` fires a `TOKEN_REFRESHED` event; the client's `autoRefreshToken: true` handles this automatically
- On unrecoverable errors (schema mismatch, 4xx responses), sync is paused and error surfaced to UI

## Changes to Existing Code

### Minimal modifications (by design):

| File | Change |
|------|--------|
| `store/heroStore.ts` | Add `deletedHeroIds: string[]` to state and `partialize`; `deleteHero()` tracks deleted IDs; add `clearDeletedHeroIds()` and `mergeHeroes()` actions; bump store version to 2 with v1->v2 migration |
| `types/index.ts` | Add `SyncState`, `AuthUser` types |
| `app/_layout.tsx` | Init auth listener; init/destroy SyncService on auth state change; add `Stack.Screen` for `auth` route |
| `app/index.tsx` | Add profile icon in header (next to theme toggle) |
| `package.json` | Add new dependencies |
| `app.json` | Add auth-related Expo plugins |

### Store Migration (v1 -> v2)
```ts
if (version === 1) {
  return { ...state, deletedHeroIds: [] };
}
```

### `partialize` Update
Update the existing `partialize` to include `deletedHeroIds`:
```ts
partialize: (state) => ({
  heroes: state.heroes,
  currentHeroId: state.currentHeroId,
  deletedHeroIds: state.deletedHeroIds,
}),
```

### No changes to:
- Any existing component (HealthTracker, StatBlock, EquipmentSelector, etc.)
- Any existing hook logic (useHero computed stats, useUndoRedo)
- Any data file (heroes, weapons, armor, spells, items, quests)
- Theme system

## New Files

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client with AsyncStorage session adapter |
| `services/syncService.ts` | Core sync engine |
| `hooks/useAuth.ts` | Auth state hook |
| `hooks/useSync.ts` | Sync state React hook |
| `app/auth.tsx` | Auth/profile screen |
| `supabase/schema.sql` | Database schema + RLS + functions (for reference/setup) |

## New Dependencies

- `@supabase/supabase-js` — Supabase client
- `expo-apple-authentication` — Native Apple Sign-In
- `expo-auth-session` — OAuth flows (Google)
- `expo-crypto` — Required by expo-auth-session, also used for UUID generation
- `@react-native-community/netinfo` — Connectivity detection

## Auth Screen UI

- Accessed via profile icon in main header (next to theme toggle and hero switcher)
- Route: `app/auth.tsx` with `Stack.Screen` in `_layout.tsx` (presentation: modal, slide_from_bottom)
- **Signed out state**: App title, Google/Apple/Email sign-in buttons, "Continue without account" dismiss
- **Signed in state**: User email/name, sync status (last synced, sync now button), sign-out button, delete account button
- Follows existing theme system (useTheme, Cinzel font, themed colors)

## Sync Status Display

The existing "Auto-saved" indicator in the bottom bar evolves:
- **Not signed in**: "Auto-saved" (unchanged)
- **Signed in + synced**: "Synced" with cloud icon
- **Signed in + syncing**: "Syncing..." with spinner
- **Signed in + offline**: "Offline" with offline icon (local saves still work)
- **Signed in + error**: "Sync error" with retry option
