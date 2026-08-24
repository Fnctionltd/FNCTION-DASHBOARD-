-- FNCTION Dashboard V1 — seed the fixed manufacturing and marketing rows.
-- Run after 0001_init.sql. Safe to re-run: existing rows are left untouched,
-- so this will not overwrite a status you have since changed in the app.
--
-- Partners, orders, expenses and invoices are deliberately NOT seeded — they
-- are real business records and get entered through the UI.

insert into public.manufacturing_suppliers (name, sort_order) values
  ('MP Bioscience', 1),
  ('Bakpac',        2),
  ('Tiny Box',      3),
  ('China',         4)
on conflict (name) do nothing;

insert into public.manufacturing_items (supplier_id, name, status, sort_order)
select s.id, i.name, i.status, i.sort_order
from (values
  ('MP Bioscience', 'CALM',         'Reformulation',  1),
  ('MP Bioscience', 'CHARGE',       'Sampling',       2),
  ('Bakpac',        'Sachets',      'Production',     1),
  ('Bakpac',        'Pouches',      'Awaiting Quote', 2),
  ('Tiny Box',      'CALM 15 Day',  'Ordered',        1),
  ('Tiny Box',      'CALM 30 Day',  'In Production',  2),
  ('China',         'Frothers',     'Shipping',       1),
  ('China',         'Eye Masks',    'Sampling',       2)
) as i(supplier, name, status, sort_order)
join public.manufacturing_suppliers s on s.name = i.supplier
on conflict (supplier_id, name) do nothing;

insert into public.marketing_channels (name, status, sort_order) values
  ('Instagram',      'Active',       1),
  ('Meta Ads',       'Active',       2),
  ('YouTube',        'Planning',     3),
  ('TikTok',         'Active',       4),
  ('Post Schedule',  '6 Scheduled',  5),
  ('Text Message',   'Drafting',     6),
  ('Email Campaign', 'Drafting',     7)
on conflict (name) do nothing;
