-- ─────────────────────────────────────────────────────────────────────────────
-- ICE Creates Clinical Decision Tracker — database schema
-- Canonical version from the Developer Brief (§6). Run once in the Supabase
-- SQL editor (Supabase dashboard > SQL Editor > New query > paste > Run).
--
-- Row Level Security is enabled on every table so the database itself enforces
-- per-user data isolation — even a bug in app code can never leak another
-- user's decisions. Do not skip the RLS sections.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ───────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Decisions ────────────────────────────────────────────────────────────────
create table if not exists public.decisions (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  type                text check (type in ('decision','non_decision','anti_decision')) not null,
  title               text not null,
  decision_timestamp  timestamptz not null,
  setting             text,
  pressure_level      integer check (pressure_level between 1 and 5),
  context_notes       text,
  stakeholders        text,
  outcome             text check (outcome in ('pending','successful','partial','unsuccessful'))
                      default 'pending' not null,
  reflection_notes    text,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index if not exists decisions_user_id_idx   on public.decisions(user_id);
create index if not exists decisions_timestamp_idx on public.decisions(decision_timestamp desc);

alter table public.decisions enable row level security;

drop policy if exists "Users can only access own decisions" on public.decisions;
create policy "Users can only access own decisions"
  on public.decisions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every update.
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_updated_at on public.decisions;
create trigger set_updated_at
  before update on public.decisions
  for each row execute procedure public.handle_updated_at();

-- ── Table privileges ─────────────────────────────────────────────────────────
-- Required when the project's "Automatically expose new tables" setting is OFF
-- (recommended for tighter control). RLS above still enforces per-user isolation;
-- these grants simply allow the logged-in role to reach the tables at all.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles  to authenticated;
grant select, insert, update, delete on public.decisions to authenticated;
