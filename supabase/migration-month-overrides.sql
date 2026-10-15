-- Dla już działającej bazy. Uruchom w SQL Editor PRZED wgraniem nowej wersji strony.

-- 1. Wyjątki ustawień dla pojedynczych miesięcy ("tylko w tym miesiącu")
alter table public.profiles
  add column if not exists month_overrides jsonb not null default '{}'::jsonb;

-- 2. Limit 150 znaków w nazwie przedmiotu (także w bazie)
alter table public.subjects drop constraint if exists subjects_name_length;
alter table public.subjects add constraint subjects_name_length check (char_length(name) <= 150);
