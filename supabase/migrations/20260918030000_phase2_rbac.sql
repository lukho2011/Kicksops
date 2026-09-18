-- KicksOps Phase 2: roles, auth, and role-scoped RLS.
--
-- Builds on 20260918020000_phase1_foundation.sql. Introduces the
-- customer / employee / organizer role model, links customer logins to their
-- CRM row, and replaces the demo "allow all" policies with role-scoped ones.
--
-- The anti-recursion rule (learned the hard way in phase 1): every helper a
-- policy calls is STABLE + SECURITY DEFINER + `set search_path = public`, so it
-- reads profiles/customers/jobs WITHOUT re-triggering their own RLS. No policy
-- references a table whose policy references it back, so there is no cycle.
--
-- This file is idempotent and safe to re-run (including in the SQL editor).

-- ---------------------------------------------------------------------------
-- profiles: new role model + login metadata
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists is_active boolean not null default true;

-- Migrate any legacy role values before the stricter check goes back on.
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles
set role = 'customer'
where role is null or role not in ('customer', 'employee', 'organizer');
alter table public.profiles alter column role set default 'customer';
alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'employee', 'organizer'));

-- Backfill emails from auth.users for profiles created before this column.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

-- ---------------------------------------------------------------------------
-- customers: link a customer login to their CRM row
-- ---------------------------------------------------------------------------

alter table public.customers
  add column if not exists profile_id uuid references auth.users(id) on delete set null;

create index if not exists customers_profile_id_idx on public.customers (profile_id);

-- ---------------------------------------------------------------------------
-- Auth trigger: new signups are customers attached to the demo org
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  demo_org_id uuid;
  resolved_name text;
begin
  select id into demo_org_id from public.orgs where slug = 'demo-org';
  resolved_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'Customer');

  insert into public.profiles (id, org_id, full_name, email, role)
  values (new.id, demo_org_id, resolved_name, new.email, 'customer')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  -- Give every customer a CRM row so bookings can attach to it.
  insert into public.customers (org_id, profile_id, display_name, email, notes)
  select demo_org_id, new.id, resolved_name, new.email, 'Self-service customer signup.'
  where not exists (
    select 1 from public.customers where profile_id = new.id
  );

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Role helper functions (STABLE, SECURITY DEFINER — the anti-recursion fix)
-- ---------------------------------------------------------------------------

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('employee', 'organizer') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_organizer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'organizer' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.customers where profile_id = auth.uid() limit 1;
$$;

create or replace function public.owns_job(target_job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.jobs
    where id = target_job and customer_id = public.current_customer_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- Reset every existing policy (repairs demo allow-all + any recursed policy)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Role-scoped policies
-- ---------------------------------------------------------------------------

-- orgs: any authenticated user may read the org (needed to resolve demo org);
-- only organizers may change it.
create policy "orgs_read_authenticated" on public.orgs
  for select using (auth.uid() is not null);
create policy "orgs_organizer_write" on public.orgs
  for all using (public.is_organizer()) with check (public.is_organizer());

-- profiles: self read/update; organizers manage everyone.
create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_organizer_all" on public.profiles
  for all using (public.is_organizer()) with check (public.is_organizer());

-- org_members: staff-only bookkeeping table.
create policy "org_members_staff_all" on public.org_members
  for all using (public.is_staff()) with check (public.is_staff());

-- customers: staff manage their org; a customer sees only their own row.
create policy "customers_staff_all" on public.customers
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "customers_self_select" on public.customers
  for select using (profile_id = auth.uid());

-- service_items: all authenticated may browse; organizers manage the catalogue.
create policy "service_items_read_authenticated" on public.service_items
  for select using (auth.uid() is not null);
create policy "service_items_organizer_write" on public.service_items
  for all using (public.is_organizer()) with check (public.is_organizer());

-- jobs: staff manage their org; a customer sees and books their own jobs.
create policy "jobs_staff_all" on public.jobs
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "jobs_customer_select" on public.jobs
  for select using (customer_id = public.current_customer_id());
create policy "jobs_customer_insert" on public.jobs
  for insert with check (customer_id = public.current_customer_id());

-- order_items: staff manage their org; a customer sees and books their own pairs.
create policy "order_items_staff_all" on public.order_items
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "order_items_customer_select" on public.order_items
  for select using (public.owns_job(job_id));
create policy "order_items_customer_insert" on public.order_items
  for insert with check (public.owns_job(job_id));

-- Everything else is staff-only, scoped to the staff member's org.
create policy "job_events_staff_all" on public.job_events
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "item_photos_staff_all" on public.item_photos
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "payments_staff_all" on public.payments
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "ai_runs_staff_all" on public.ai_runs
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "conversations_staff_all" on public.conversations
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "messages_staff_all" on public.messages
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "tasks_staff_all" on public.tasks
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "pickup_slots_staff_all" on public.pickup_slots
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());
create policy "runs_staff_all" on public.runs
  for all using (public.is_staff() and org_id = public.current_org_id())
  with check (public.is_staff() and org_id = public.current_org_id());

-- ---------------------------------------------------------------------------
-- Seed the service catalogue (mirrors lib/pricing.ts)
-- ---------------------------------------------------------------------------

insert into public.service_items (org_id, name, code, price, active)
select org.id, seed.name, seed.code, seed.price, true
from public.orgs org
cross join (values
  ('Basic Clean', 'basic-clean', 80),
  ('Standard Deep Clean', 'standard-deep-clean', 100),
  ('Sole Whitening', 'sole-whitening', 70),
  ('Crocs & Slide Wash', 'crocs-and-slide-wash', 35)
) as seed(name, code, price)
where org.slug = 'demo-org'
  and not exists (
    select 1 from public.service_items existing
    where existing.org_id = org.id and existing.code = seed.code
  );
