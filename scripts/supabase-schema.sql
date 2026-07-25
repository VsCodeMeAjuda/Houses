-- ============================================================================
-- Property Manager — Complete PostgreSQL schema for Supabase
-- ----------------------------------------------------------------------------
-- Run this entire script in the Supabase SQL Editor.
-- It is idempotent: it drops existing objects before recreating them.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Clean slate (order matters because of foreign keys)
-- ----------------------------------------------------------------------------
drop table if exists documents cascade;
drop table if exists notifications cascade;
drop table if exists activities cascade;
drop table if exists maintenance_tasks cascade;
drop table if exists expenses cascade;
drop table if exists payments cascade;
drop table if exists tenants cascade;
drop table if exists properties cascade;

-- ----------------------------------------------------------------------------
-- PROPERTIES
-- ----------------------------------------------------------------------------
create table properties (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  address           text not null,
  photo             text default '',
  status            text not null default 'vacant'
                      check (status in ('occupied', 'vacant')),
  monthly_rent      numeric(12,2) not null default 0 check (monthly_rent >= 0),
  purchase_price    numeric(14,2) not null default 0 check (purchase_price >= 0),
  total_investment  numeric(14,2) not null default 0 check (total_investment >= 0),
  market_value      numeric(14,2) not null default 0 check (market_value >= 0),
  purchase_date     timestamptz not null default now(),
  purchase_method   text not null default 'cash'
                      check (purchase_method in ('cash','financing','mortgage','installments')),
  current_tenant_id uuid, -- FK added after tenants table exists
  bedrooms          integer not null default 0 check (bedrooms >= 0),
  bathrooms         integer not null default 0 check (bathrooms >= 0),
  area              numeric(10,2) not null default 0 check (area >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TENANTS
-- ----------------------------------------------------------------------------
create table tenants (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  cpf               text not null default '',
  phone             text not null default '',
  email             text not null default '',
  property_id       uuid references properties(id) on delete set null,
  contract_start    timestamptz not null default now(),
  contract_end      timestamptz not null default now(),
  monthly_rent      numeric(12,2) not null default 0 check (monthly_rent >= 0),
  security_deposit  numeric(12,2) not null default 0 check (security_deposit >= 0),
  payment_due_day   integer not null default 1 check (payment_due_day between 1 and 31),
  payment_status    text not null default 'pending'
                      check (payment_status in ('paid','due-soon','overdue','pending')),
  relationship      text not null default 'direct'
                      check (relationship in ('direct','agency','commissioned')),
  commission_percent numeric(5,2) not null default 0 check (commission_percent >= 0),
  payment_method    text not null default 'pix'
                      check (payment_method in ('pix','transfer','cash','credit','debit')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Circular reference: a property points at its current tenant
alter table properties
  add constraint properties_current_tenant_fk
  foreign key (current_tenant_id) references tenants(id) on delete set null;

-- ----------------------------------------------------------------------------
-- PAYMENTS (income)
-- ----------------------------------------------------------------------------
create table payments (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references tenants(id) on delete set null,
  property_id  uuid references properties(id) on delete cascade,
  due_date     timestamptz not null default now(),
  amount       numeric(12,2) not null default 0 check (amount >= 0),
  status       text not null default 'pending'
                 check (status in ('paid','due-soon','overdue','pending')),
  paid_date    timestamptz,
  method       text not null default 'pix'
                 check (method in ('pix','transfer','cash','credit','debit')),
  category     text not null default 'rent'
                 check (category in ('rent','deposit','other-income')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- EXPENSES
-- ----------------------------------------------------------------------------
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid references properties(id) on delete cascade,
  category     text not null default 'other-expense'
                 check (category in ('maintenance','repairs','renovations','taxes',
                                     'insurance','utilities','hoa','other-expense')),
  description  text not null default '',
  amount       numeric(12,2) not null default 0 check (amount >= 0),
  date         timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- MAINTENANCE TASKS
-- ----------------------------------------------------------------------------
create table maintenance_tasks (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid references properties(id) on delete cascade,
  title           text not null,
  description     text not null default '',
  priority        text not null default 'medium'
                    check (priority in ('low','medium','high','urgent')),
  status          text not null default 'pending'
                    check (status in ('pending','in-progress','completed')),
  created_date    timestamptz not null default now(),
  due_date        timestamptz,
  estimated_cost  numeric(12,2) not null default 0 check (estimated_cost >= 0),
  actual_cost     numeric(12,2) not null default 0 check (actual_cost >= 0),
  notes           text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ACTIVITIES (audit feed)
-- ----------------------------------------------------------------------------
create table activities (
  id           uuid primary key default gen_random_uuid(),
  type         text not null default 'payment'
                 check (type in ('payment','tenant','expense','deposit','contract')),
  title        text not null,
  description  text not null default '',
  date         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  date         timestamptz not null default now(),
  read         boolean not null default false,
  kind         text not null default 'system'
                 check (kind in ('payment','contract','maintenance','system'))
);

-- ----------------------------------------------------------------------------
-- DOCUMENTS
-- ----------------------------------------------------------------------------
create table documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  property_id  uuid references properties(id) on delete cascade,
  category     text not null default '',
  size         text not null default '',
  date         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
create index idx_properties_status         on properties(status);
create index idx_tenants_property           on tenants(property_id);
create index idx_tenants_payment_status     on tenants(payment_status);
create index idx_payments_property          on payments(property_id);
create index idx_payments_tenant            on payments(tenant_id);
create index idx_payments_status            on payments(status);
create index idx_payments_due_date          on payments(due_date);
create index idx_expenses_property          on expenses(property_id);
create index idx_expenses_category          on expenses(category);
create index idx_expenses_date              on expenses(date);
create index idx_maintenance_property       on maintenance_tasks(property_id);
create index idx_maintenance_status         on maintenance_tasks(status);
create index idx_maintenance_priority       on maintenance_tasks(priority);
create index idx_documents_property         on documents(property_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['properties','tenants','payments','expenses','maintenance_tasks']
  loop
    execute format('drop trigger if exists trg_%s_updated on %I;', t, t);
    execute format(
      'create trigger trg_%s_updated before update on %I
       for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- Enable RLS on every table. The policies below allow full access with the
-- anon/public key so the demo works out of the box. Tighten these (e.g. scope
-- by auth.uid()) once you add authentication.
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['properties','tenants','payments','expenses',
                           'maintenance_tasks','activities','notifications','documents']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public_all_%s" on %I;', t, t);
    execute format(
      'create policy "public_all_%s" on %I
       for all using (true) with check (true);', t, t);
  end loop;
end $$;

-- ============================================================================
-- OPTIONAL SEED DATA
-- ----------------------------------------------------------------------------
-- Sample records so the app has content right after you connect. Delete this
-- section if you prefer to start with an empty database.
-- ============================================================================
do $$
declare
  p1 uuid; p2 uuid; p3 uuid; p4 uuid;
  t1 uuid; t2 uuid; t3 uuid;
begin
  insert into properties (name, address, status, monthly_rent, purchase_price, total_investment, market_value, purchase_date, purchase_method, bedrooms, bathrooms, area)
  values
    ('Edifício Aurora 402', 'Rua das Palmeiras, 402 — Jardins, São Paulo', 'occupied', 3800, 520000, 565000, 690000, now() - interval '38 months', 'financing', 2, 2, 78) returning id into p1;
  insert into properties (name, address, status, monthly_rent, purchase_price, total_investment, market_value, purchase_date, purchase_method, bedrooms, bathrooms, area)
  values ('Casa Vila Verde', 'Alameda dos Ipês, 87 — Granja Viana, Cotia', 'occupied', 4500, 610000, 648000, 780000, now() - interval '54 months', 'cash', 3, 3, 140) returning id into p2;
  insert into properties (name, address, status, monthly_rent, purchase_price, total_investment, market_value, purchase_date, purchase_method, bedrooms, bathrooms, area)
  values ('Condomínio Skyline 1201', 'Av. Faria Lima, 1201 — Itaim Bibi, São Paulo', 'occupied', 6200, 890000, 940000, 1120000, now() - interval '26 months', 'mortgage', 3, 2, 96) returning id into p3;
  insert into properties (name, address, status, monthly_rent, purchase_price, total_investment, market_value, purchase_date, purchase_method, bedrooms, bathrooms, area)
  values ('Studio Central', 'Rua Augusta, 1500 — Consolação, São Paulo', 'vacant', 2400, 340000, 360000, 430000, now() - interval '18 months', 'installments', 1, 1, 38) returning id into p4;

  insert into tenants (full_name, cpf, phone, email, property_id, contract_start, contract_end, monthly_rent, security_deposit, payment_due_day, payment_status, relationship, commission_percent, payment_method)
  values ('Mariana Costa', '123.456.789-01', '(11) 98765-4321', 'mariana.costa@email.com', p1, now() - interval '10 months', now() + interval '60 days', 3800, 7600, 5, 'paid', 'direct', 0, 'pix') returning id into t1;
  insert into tenants (full_name, cpf, phone, email, property_id, contract_start, contract_end, monthly_rent, security_deposit, payment_due_day, payment_status, relationship, commission_percent, payment_method)
  values ('Rafael Almeida', '987.654.321-09', '(11) 91234-5678', 'rafael.almeida@email.com', p2, now() - interval '22 months', now() + interval '4 days', 4500, 9000, 10, 'due-soon', 'agency', 8, 'transfer') returning id into t2;
  insert into tenants (full_name, cpf, phone, email, property_id, contract_start, contract_end, monthly_rent, security_deposit, payment_due_day, payment_status, relationship, commission_percent, payment_method)
  values ('Juliana Santos', '456.789.123-45', '(11) 99876-5432', 'juliana.santos@email.com', p3, now() - interval '6 months', now() + interval '180 days', 6200, 12400, 1, 'overdue', 'commissioned', 5, 'pix') returning id into t3;

  update properties set current_tenant_id = t1 where id = p1;
  update properties set current_tenant_id = t2 where id = p2;
  update properties set current_tenant_id = t3 where id = p3;

  insert into payments (tenant_id, property_id, due_date, amount, status, paid_date, method, category) values
    (t1, p1, now() + interval '3 days', 3800, 'due-soon', null, 'pix', 'rent'),
    (t2, p2, now() + interval '7 days', 4500, 'due-soon', null, 'transfer', 'rent'),
    (t3, p3, now() - interval '5 days', 6200, 'overdue', null, 'pix', 'rent'),
    (t1, p1, now() - interval '27 days', 3800, 'paid', now() - interval '27 days', 'pix', 'rent'),
    (t2, p2, now() - interval '23 days', 4500, 'paid', now() - interval '22 days', 'transfer', 'rent'),
    (t3, p3, now() - interval '35 days', 6200, 'paid', now() - interval '35 days', 'pix', 'rent');

  insert into expenses (property_id, category, description, amount, date) values
    (p1, 'hoa', 'Condomínio Edifício Aurora', 650, now() - interval '12 days'),
    (p2, 'maintenance', 'Manutenção do jardim', 320, now() - interval '18 days'),
    (p3, 'repairs', 'Reparo hidráulico banheiro', 890, now() - interval '6 days'),
    (p1, 'taxes', 'IPTU parcela 8/10', 420, now() - interval '9 days'),
    (p4, 'renovations', 'Pintura completa do studio', 2800, now() - interval '30 days'),
    (p2, 'insurance', 'Seguro residencial anual', 1200, now() - interval '40 days'),
    (p3, 'utilities', 'Energia área comum', 180, now() - interval '4 days');

  insert into maintenance_tasks (property_id, title, description, priority, status, created_date, due_date, estimated_cost, actual_cost, notes) values
    (p3, 'Reparo hidráulico no banheiro', 'Vazamento na tubulação do banheiro social precisa de reparo imediato.', 'high', 'completed', now() - interval '12 days', now() - interval '6 days', 800, 890, 'Substituída a conexão do registro. Garantia de 6 meses.'),
    (p2, 'Manutenção do jardim', 'Poda das árvores e limpeza geral da área externa.', 'low', 'in-progress', now() - interval '8 days', now() + interval '2 days', 350, 0, ''),
    (p4, 'Pintura completa do studio', 'Repintura de todas as paredes antes de nova locação.', 'medium', 'pending', now() - interval '3 days', now() + interval '14 days', 2800, 0, 'Aguardando orçamento do fornecedor.'),
    (p1, 'Troca do disjuntor geral', 'Quadro de energia apresentando falhas intermitentes.', 'urgent', 'pending', now() - interval '1 days', now() + interval '3 days', 450, 0, '');

  insert into notifications (title, description, date, read, kind) values
    ('Aluguel vencendo em breve', 'Mariana Costa vence em 3 dias (R$ 3.800)', now(), false, 'payment'),
    ('Pagamento em atraso', 'Juliana Santos está 5 dias atrasada (R$ 6.200)', now() - interval '5 days', false, 'payment'),
    ('Contrato encerrando', 'Contrato de Rafael Almeida termina em 4 dias', now() - interval '1 days', false, 'contract'),
    ('Manutenção concluída', 'Reparo hidráulico no Skyline 1201 finalizado', now() - interval '6 days', true, 'maintenance');
end $$;
