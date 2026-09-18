create extension if not exists "pgcrypto";

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

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create policy "profiles_select_own_org" on public.profiles
for select using (org_id = public.current_org_id());

create policy "profiles_update_own_org" on public.profiles
for update using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "org_members_select_own_org" on public.org_members
for select using (org_id = public.current_org_id());

create policy "org_members_manage_own_org" on public.org_members
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "customers_select_own_org" on public.customers
for select using (org_id = public.current_org_id());

create policy "customers_manage_own_org" on public.customers
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "jobs_select_own_org" on public.jobs
for select using (org_id = public.current_org_id());

create policy "jobs_manage_own_org" on public.jobs
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "job_events_select_own_org" on public.job_events
for select using (org_id = public.current_org_id());

create policy "job_events_manage_own_org" on public.job_events
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "service_items_select_own_org" on public.service_items
for select using (org_id = public.current_org_id());

create policy "service_items_manage_own_org" on public.service_items
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "order_items_select_own_org" on public.order_items
for select using (org_id = public.current_org_id());

create policy "order_items_manage_own_org" on public.order_items
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "item_photos_select_own_org" on public.item_photos
for select using (org_id = public.current_org_id());

create policy "item_photos_manage_own_org" on public.item_photos
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "payments_select_own_org" on public.payments
for select using (org_id = public.current_org_id());

create policy "payments_manage_own_org" on public.payments
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "ai_runs_select_own_org" on public.ai_runs
for select using (org_id = public.current_org_id());

create policy "ai_runs_manage_own_org" on public.ai_runs
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "conversations_select_own_org" on public.conversations
for select using (org_id = public.current_org_id());

create policy "conversations_manage_own_org" on public.conversations
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "messages_select_own_org" on public.messages
for select using (org_id = public.current_org_id());

create policy "messages_manage_own_org" on public.messages
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "tasks_select_own_org" on public.tasks
for select using (org_id = public.current_org_id());

create policy "tasks_manage_own_org" on public.tasks
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "pickup_slots_select_own_org" on public.pickup_slots
for select using (org_id = public.current_org_id());

create policy "pickup_slots_manage_own_org" on public.pickup_slots
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "runs_select_own_org" on public.runs
for select using (org_id = public.current_org_id());

create policy "runs_manage_own_org" on public.runs
for all using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, org_id, full_name, role)
  values (new.id, null, coalesce(new.raw_user_meta_data->>'full_name', 'Staff'), 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_orgs
before update on public.orgs
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_customers
before update on public.customers
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_jobs
before update on public.jobs
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_service_items
before update on public.service_items
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_order_items
before update on public.order_items
for each row execute procedure public.set_updated_at();
