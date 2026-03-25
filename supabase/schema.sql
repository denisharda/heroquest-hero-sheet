-- HeroQuest Hero Sheet - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Heroes table: stores hero data as JSONB documents
create table if not exists heroes (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at bigint not null,
  created_at bigint not null,
  deleted_at bigint,
  primary key (user_id, id)
);

-- Index for fast user lookups
create index if not exists idx_heroes_user_id on heroes(user_id);

-- Row Level Security: users can only access their own heroes
alter table heroes enable row level security;

create policy "Users can select own heroes"
  on heroes for select
  using (auth.uid() = user_id);

create policy "Users can insert own heroes"
  on heroes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own heroes"
  on heroes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own heroes"
  on heroes for delete
  using (auth.uid() = user_id);

-- Conflict-safe upsert: only overwrites if incoming updatedAt is newer
create or replace function upsert_hero(
  p_id text,
  p_user_id uuid,
  p_data jsonb,
  p_updated_at bigint,
  p_created_at bigint
) returns void as $$
begin
  insert into heroes (id, user_id, data, updated_at, created_at)
  values (p_id, p_user_id, p_data, p_updated_at, p_created_at)
  on conflict (user_id, id) do update
  set data = p_data, updated_at = p_updated_at
  where heroes.updated_at < p_updated_at;
end;
$$ language plpgsql security definer;

-- Soft delete: mark a hero as deleted (used for offline delete propagation)
create or replace function soft_delete_hero(
  p_id text,
  p_user_id uuid,
  p_deleted_at bigint
) returns void as $$
begin
  update heroes
  set deleted_at = p_deleted_at
  where id = p_id and user_id = p_user_id and deleted_at is null;
end;
$$ language plpgsql security definer;

-- Account deletion (required by Apple App Store)
create or replace function delete_own_account()
returns void as $$
begin
  -- Heroes are cascade-deleted via FK
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
