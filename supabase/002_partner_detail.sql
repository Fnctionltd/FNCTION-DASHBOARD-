-- =====================================================================
--  FNCTION Dashboard — partner detail
--
--  Adds a margin figure to partners and a place to record marketing
--  activations against them.
--
--  Paste this whole file into the Supabase SQL Editor and press Run.
--  Safe to run twice.
-- =====================================================================

-- Trade margin, as a percentage, e.g. 42.5
alter table public.partners
  add column if not exists margin_percent numeric(5,2);

create table if not exists public.partner_activations (
  id           uuid primary key default gen_random_uuid(),
  partner_id   uuid not null references public.partners(id) on delete cascade,
  happened_on  date not null default current_date,
  title        text not null,
  channel      text,
  status       text not null default 'Planned',
  -- Optional cost of the activation, in whole pence like every other amount.
  spend_pence  bigint check (spend_pence is null or spend_pence >= 0),
  notes        text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists partner_activations_partner_idx
  on public.partner_activations (partner_id, happened_on desc);

drop trigger if exists touch_partner_activations on public.partner_activations;
create trigger touch_partner_activations
  before update on public.partner_activations
  for each row execute function public.touch_updated_at();

grant select, insert, update, delete on public.partner_activations to authenticated;

alter table public.partner_activations enable row level security;

drop policy if exists team_all on public.partner_activations;
create policy team_all on public.partner_activations
  for all to authenticated using (true) with check (true);

-- So one person's edit reaches the other's screen without a refresh.
do $$
begin
  alter publication supabase_realtime add table public.partner_activations;
exception when duplicate_object then null;
end $$;
