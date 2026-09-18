-- KicksOps Phase 1 foundation (canonical migration).
--
-- Tables, row level security, demo access policies, auth trigger, and demo
-- seed data. This file is the source of truth for the Supabase project and is
-- safe to re-run (including directly in the Supabase SQL editor): every
-- statement is idempotent.
--
-- The demo "allow all" policies intentionally keep the app usable with the
-- publishable key while the product is a demo shell. Replace them with
-- org-scoped policies (org_id = public.current_org_id()) before real
-- customer data lands in production.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.orgs(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('owner', 'operator', 'runner', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'operator', 'runner', 'viewer')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  display_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  customer_id uuid references public.customers(id),
  reference text not null,
  order_value numeric(10,2) not null default 0,
  current_stage text not null default 'enquiry' check (current_stage in ('enquiry','booked','collected','in_wash','in_treatment','drying','finishing','qc','ready','out_for_delivery','delivered','paid','closed','on_hold','rework','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  owner_id uuid references auth.users(id),
  assigned_operator_id uuid references auth.users(id),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  event_type text not null,
  previous_stage text,
  new_stage text,
  actor_id uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  code text not null,
  price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  pair_code text not null,
  brand text,
  model text,
  size text,
  colour text,
  material text,
  soil_level integer check (soil_level between 1 and 5),
  damage_flags text[],
  service_item_id uuid references public.service_items(id),
  price numeric(10,2) not null default 0,
  risk_accepted boolean not null default false,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  current_station text not null default 'queue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, pair_code)
);

create table if not exists public.item_photos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete cascade,
  phase text not null check (phase in ('before','after')),
  angle text not null,
  storage_path text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash','eft','yoco')),
  reference text,
  received_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  purpose text not null default 'shoe_triage',
  model text not null,
  prompt_version text,
  input_reference text,
  output jsonb,
  confidence numeric(5,2),
  latency_ms integer,
  human_verdict text,
  human_correction text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  customer_id uuid references public.customers(id),
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open','in_progress','done','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pickup_slots (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  location text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  capacity integer not null default 1,
  assigned_runner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.orgs enable row level security;
alter table public.profiles enable row level security;
alter table public.org_members enable row level security;
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.job_events enable row level security;
alter table public.service_items enable row level security;
alter table public.order_items enable row level security;
alter table public.item_photos enable row level security;
alter table public.payments enable row level security;
alter table public.ai_runs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.pickup_slots enable row level security;
alter table public.runs enable row level security;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Returns the org of the signed-in user. Single definition, kept for the
-- future org-scoped RLS phase. The demo policies below do not reference it,
-- so no policy recursion is possible.
create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- Keeps public.profiles in sync with auth.users. New users are attached to
-- the demo org so the app has a real org_id to read and write against.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, org_id, full_name, role)
  values (
    new.id,
    (select id from public.orgs where slug = 'demo-org'),
    coalesce(new.raw_user_meta_data->>'full_name', 'Staff'),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Access policies (demo: allow all)
-- ---------------------------------------------------------------------------
--
-- Every existing policy on public tables is dropped first. This repairs
-- projects where stricter org-scoped policies were applied and recursed
-- through current_org_id() (profiles policy -> current_org_id() -> profiles),
-- which made every query fail with "stack depth limit exceeded". It also
-- makes this migration safe to re-run.

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select p.schemaname, p.tablename, p.policyname
    from pg_policies p
    join pg_namespace n on n.nspname = p.schemaname
    join pg_class c on c.relname = p.tablename and c.relnamespace = n.oid
    where p.schemaname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end
$$;

drop policy if exists "orgs_allow_all" on public.orgs;
create policy "orgs_allow_all" on public.orgs
for all using (true) with check (true);

drop policy if exists "profiles_allow_all" on public.profiles;
create policy "profiles_allow_all" on public.profiles
for all using (true) with check (true);

drop policy if exists "org_members_allow_all" on public.org_members;
create policy "org_members_allow_all" on public.org_members
for all using (true) with check (true);

drop policy if exists "customers_allow_all" on public.customers;
create policy "customers_allow_all" on public.customers
for all using (true) with check (true);

drop policy if exists "jobs_allow_all" on public.jobs;
create policy "jobs_allow_all" on public.jobs
for all using (true) with check (true);

drop policy if exists "job_events_allow_all" on public.job_events;
create policy "job_events_allow_all" on public.job_events
for all using (true) with check (true);

drop policy if exists "service_items_allow_all" on public.service_items;
create policy "service_items_allow_all" on public.service_items
for all using (true) with check (true);

drop policy if exists "order_items_allow_all" on public.order_items;
create policy "order_items_allow_all" on public.order_items
for all using (true) with check (true);

drop policy if exists "item_photos_allow_all" on public.item_photos;
create policy "item_photos_allow_all" on public.item_photos
for all using (true) with check (true);

drop policy if exists "payments_allow_all" on public.payments;
create policy "payments_allow_all" on public.payments
for all using (true) with check (true);

drop policy if exists "ai_runs_allow_all" on public.ai_runs;
create policy "ai_runs_allow_all" on public.ai_runs
for all using (true) with check (true);

drop policy if exists "conversations_allow_all" on public.conversations;
create policy "conversations_allow_all" on public.conversations
for all using (true) with check (true);

drop policy if exists "messages_allow_all" on public.messages;
create policy "messages_allow_all" on public.messages
for all using (true) with check (true);

drop policy if exists "tasks_allow_all" on public.tasks;
create policy "tasks_allow_all" on public.tasks
for all using (true) with check (true);

drop policy if exists "pickup_slots_allow_all" on public.pickup_slots;
create policy "pickup_slots_allow_all" on public.pickup_slots
for all using (true) with check (true);

drop policy if exists "runs_allow_all" on public.runs;
create policy "runs_allow_all" on public.runs
for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_updated_at_orgs on public.orgs;
create trigger set_updated_at_orgs
before update on public.orgs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_customers on public.customers;
create trigger set_updated_at_customers
before update on public.customers
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_jobs on public.jobs;
create trigger set_updated_at_jobs
before update on public.jobs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_service_items on public.service_items;
create trigger set_updated_at_service_items
before update on public.service_items
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_order_items on public.order_items;
create trigger set_updated_at_order_items
before update on public.order_items
for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------------

-- One demo org so the app always has a real org_id to write against.
insert into public.orgs (name, slug)
values ('Demo Org', 'demo-org')
on conflict (slug) do nothing;

-- Attach profiles that were created before the demo org existed.
update public.profiles
set org_id = (select id from public.orgs where slug = 'demo-org')
where org_id is null;

-- One demo customer so the directory is not empty on first load.
insert into public.customers (org_id, display_name, phone, email, notes)
select org.id, 'Lukho Mokoena', '+27821234567', 'lukho@example.com', 'Seeded demo customer.'
from public.orgs org
where org.slug = 'demo-org'
  and not exists (
    select 1 from public.customers existing
    where existing.org_id = org.id
      and existing.display_name = 'Lukho Mokoena'
  );
