-- Seed data applied by `supabase db reset` during local development.
-- Mirrors the seed embedded in the phase 1 migration so local and remote
-- projects stay consistent.

insert into public.orgs (name, slug)
values ('Demo Org', 'demo-org')
on conflict (slug) do nothing;

update public.profiles
set org_id = (select id from public.orgs where slug = 'demo-org')
where org_id is null;

insert into public.customers (org_id, display_name, phone, email, notes)
select org.id, 'Lukho Mokoena', '+27821234567', 'lukho@example.com', 'Seeded demo customer.'
from public.orgs org
where org.slug = 'demo-org'
  and not exists (
    select 1 from public.customers existing
    where existing.org_id = org.id
      and existing.display_name = 'Lukho Mokoena'
  );
