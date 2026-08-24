-- FNCTION Dashboard V1 — schema, row level security, realtime.
-- Run once in the Supabase SQL Editor. Safe to re-run: every statement guards itself.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — display names for note authorship, one row per auth user
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      initcap(split_part(new.email, '@', 1))
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill, so it does not matter whether the users were created before or
-- after this migration ran.
insert into public.profiles (id, display_name)
select u.id,
       coalesce(
         nullif(u.raw_user_meta_data->>'display_name', ''),
         initcap(split_part(u.email, '@', 1))
       )
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- distribution
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.partner_type as enum ('existing', 'future');
exception when duplicate_object then null;
end $$;

create table if not exists public.partners (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            public.partner_type not null default 'existing',
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  location        text,
  -- Future partners only: where they sit in the pipeline, e.g.
  -- 'Contacted', 'Samples Sent', 'Negotiating', 'Awaiting Decision'.
  stage           text,
  needs_follow_up boolean not null default false,
  next_action     text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  partner_id   uuid not null references public.partners(id) on delete cascade,
  ordered_on   date not null default current_date,
  reference    text,
  description  text,
  -- Money is stored as whole pence. Never floats: 0.1 + 0.2 is not 0.3.
  amount_pence bigint not null default 0 check (amount_pence >= 0),
  status       text not null default 'Placed',
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists orders_partner_idx on public.orders (partner_id, ordered_on desc);

-- ---------------------------------------------------------------------------
-- finance
-- ---------------------------------------------------------------------------

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  spent_on     date not null default current_date,
  supplier     text not null,
  category     text,
  description  text,
  amount_pence bigint not null check (amount_pence >= 0),
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists expenses_spent_on_idx on public.expenses (spent_on desc);

create table if not exists public.invoices (
  id           uuid primary key default gen_random_uuid(),
  -- Linked partner where there is one; counterparty covers everyone else.
  partner_id   uuid references public.partners(id) on delete set null,
  counterparty text not null,
  reference    text,
  description  text,
  amount_pence bigint not null check (amount_pence >= 0),
  issued_on    date not null default current_date,
  due_on       date not null,
  -- Paid/due/overdue is derived from paid_on and due_on at read time rather
  -- than stored, so an unpaid invoice becomes overdue on its own.
  paid_on      date,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists invoices_open_idx on public.invoices (due_on) where paid_on is null;

-- ---------------------------------------------------------------------------
-- manufacturing
-- ---------------------------------------------------------------------------

create table if not exists public.manufacturing_suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.manufacturing_items (
  id             uuid primary key default gen_random_uuid(),
  supplier_id    uuid not null references public.manufacturing_suppliers(id) on delete cascade,
  name           text not null,
  status         text not null default 'Not Started',
  current_action text,
  sort_order     integer not null default 0,
  updated_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (supplier_id, name)
);

-- ---------------------------------------------------------------------------
-- marketing
-- ---------------------------------------------------------------------------

create table if not exists public.marketing_channels (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  status         text not null default 'Planning',
  current_action text,
  sort_order     integer not null default 0,
  updated_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notes — one table, three possible parents, exactly one of them set
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id                    uuid primary key default gen_random_uuid(),
  partner_id            uuid references public.partners(id) on delete cascade,
  manufacturing_item_id uuid references public.manufacturing_items(id) on delete cascade,
  marketing_channel_id  uuid references public.marketing_channels(id) on delete cascade,
  body                  text not null check (length(btrim(body)) > 0),
  author_id             uuid not null references public.profiles(id) on delete cascade,
  created_at            timestamptz not null default now(),
  constraint notes_exactly_one_parent check (
    (partner_id is not null)::integer
  + (manufacturing_item_id is not null)::integer
  + (marketing_channel_id is not null)::integer = 1
  )
);

create index if not exists notes_partner_idx    on public.notes (partner_id, created_at desc);
create index if not exists notes_mfg_item_idx   on public.notes (manufacturing_item_id, created_at desc);
create index if not exists notes_mkt_channel_idx on public.notes (marketing_channel_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'partners', 'orders', 'expenses', 'invoices',
    'manufacturing_items', 'marketing_channels'
  ] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$I
         for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- row level security
--
-- Sam and Helen share one dataset: any signed-in user reads and writes
-- everything. Notes are the exception — they carry an author and a date, so
-- only their author may edit or delete one. Nothing is readable while signed
-- out, which is what makes the publishable key safe to ship to the browser.
-- ---------------------------------------------------------------------------

-- Supabase already grants these by default; stated explicitly so the schema
-- does not depend on that default still being in place. Row level security,
-- not the absence of grants, is what restricts access.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'partners', 'orders', 'expenses', 'invoices',
    'manufacturing_suppliers', 'manufacturing_items', 'marketing_channels', 'notes'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Shared read/write for the team.
  foreach t in array array[
    'partners', 'orders', 'expenses', 'invoices',
    'manufacturing_suppliers', 'manufacturing_items', 'marketing_channels'
  ] loop
    execute format('drop policy if exists team_all on public.%I', t);
    execute format(
      'create policy team_all on public.%I for all to authenticated
         using (true) with check (true)', t);
  end loop;
end $$;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists notes_read on public.notes;
create policy notes_read on public.notes
  for select to authenticated using (true);

drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own on public.notes
  for insert to authenticated with check (author_id = (select auth.uid()));

drop policy if exists notes_update_own on public.notes;
create policy notes_update_own on public.notes
  for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));

drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own on public.notes
  for delete to authenticated using (author_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- realtime — so Sam's edit appears on Helen's screen without a refresh
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'partners', 'orders', 'expenses', 'invoices',
    'manufacturing_items', 'marketing_channels', 'notes'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
