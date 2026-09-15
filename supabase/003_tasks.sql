-- =====================================================================
--  FNCTION Dashboard — weekly tasks
--
--  Paste this whole file into the Supabase SQL Editor and press Run.
--  Safe to run twice.
-- =====================================================================

create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (length(btrim(title)) > 0),
  done       boolean not null default false,
  done_at    timestamptz,
  done_by    uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_open_idx on public.tasks (created_at) where not done;

drop trigger if exists touch_tasks on public.tasks;
create trigger touch_tasks
  before update on public.tasks
  for each row execute function public.touch_updated_at();

grant select, insert, update, delete on public.tasks to authenticated;

alter table public.tasks enable row level security;

-- A shared list: either of you can add, tick and clear anything on it.
drop policy if exists team_all on public.tasks;
create policy team_all on public.tasks
  for all to authenticated using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;
