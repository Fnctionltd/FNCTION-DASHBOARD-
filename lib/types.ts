export type PartnerType = "existing" | "future";

export type Profile = {
  id: string;
  display_name: string;
};

export type Partner = {
  id: string;
  name: string;
  type: PartnerType;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  stage: string | null;
  needs_follow_up: boolean;
  next_action: string | null;
  /** Trade margin as a percentage, e.g. 42.5 */
  margin_percent: number | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  partner_id: string;
  ordered_on: string;
  reference: string | null;
  description: string | null;
  amount_pence: number;
  status: string;
  created_at: string;
};

export type Activation = {
  id: string;
  partner_id: string;
  happened_on: string;
  title: string;
  channel: string | null;
  status: string;
  spend_pence: number | null;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  spent_on: string;
  supplier: string;
  category: string | null;
  description: string | null;
  amount_pence: number;
  created_at: string;
};

export type Invoice = {
  id: string;
  partner_id: string | null;
  counterparty: string;
  reference: string | null;
  description: string | null;
  amount_pence: number;
  issued_on: string;
  due_on: string;
  paid_on: string | null;
  created_at: string;
};

export type ManufacturingSupplier = {
  id: string;
  name: string;
  sort_order: number;
};

export type ManufacturingItem = {
  id: string;
  supplier_id: string;
  name: string;
  status: string;
  current_action: string | null;
  sort_order: number;
  updated_at: string;
};

export type MarketingChannel = {
  id: string;
  name: string;
  status: string;
  current_action: string | null;
  sort_order: number;
  updated_at: string;
};

export type Note = {
  id: string;
  partner_id: string | null;
  manufacturing_item_id: string | null;
  marketing_channel_id: string | null;
  body: string;
  author_id: string;
  created_at: string;
};

export type DashboardData = {
  profiles: Profile[];
  partners: Partner[];
  orders: Order[];
  activations: Activation[];
  expenses: Expense[];
  invoices: Invoice[];
  suppliers: ManufacturingSupplier[];
  items: ManufacturingItem[];
  channels: MarketingChannel[];
  notes: Note[];
};
