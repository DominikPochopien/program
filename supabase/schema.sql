-- Pełna struktura bazy dla NOWEGO projektu Supabase.
-- Wklej w SQL Editor -> New query -> Run.
-- (Dla już działającej bazy użyj pliku migration-month-overrides.sql.)

create table public.subjects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) <= 150),
  color      text not null,
  created_at timestamptz not null default now()
);

create table public.classes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  date       date not null,
  start_time time not null,
  end_time   time,
  status     text not null default 'planned'
             check (status in ('planned', 'present', 'absent', 'cancelled', 'no_check'))
);

create index classes_user_date_idx on public.classes (user_id, date);

-- Ustawienia użytkownika (widoczne dni tygodnia; 0 = niedziela)
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  visible_days    jsonb default '[1, 2, 3, 4, 5, 6, 0]'::jsonb,
  month_overrides jsonb not null default '{}'::jsonb  -- np. {"2026-10": [1, 2, 3]}
);

-- Row Level Security: każdy widzi i zmienia tylko własne wiersze.
alter table public.subjects enable row level security;
alter table public.classes  enable row level security;
alter table public.profiles enable row level security;

create policy "own subjects" on public.subjects for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own classes" on public.classes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
