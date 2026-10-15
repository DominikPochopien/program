-- Dla już działającej bazy: dodaje status "brak sprawdzania obecności" (no_check).
-- Uruchom w SQL Editor PRZED wgraniem nowej wersji strony.
alter table public.classes drop constraint if exists classes_status_check;
alter table public.classes
  add constraint classes_status_check
  check (status in ('planned', 'present', 'absent', 'cancelled', 'no_check'));
