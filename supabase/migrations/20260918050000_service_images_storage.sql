-- KicksOps: storage bucket + policies for service catalogue images.
--
-- The admin "Services" page uploads photos to a Supabase Storage bucket named
-- "service-images" (see app/(organizer)/admin/services/page.tsx). Storage keeps
-- every object in storage.objects, which has RLS enabled by default. Without a
-- bucket and matching policies, every upload fails with:
--   "new row violates row-level security policy"
--
-- This file mirrors the phase 2 RBAC model: organizers manage the catalogue, so
-- organizers may write image objects; the bucket is public so shoppers can view
-- them. It reuses public.is_organizer() (STABLE + SECURITY DEFINER) from
-- 20260918030000_phase2_rbac.sql, so there is no policy recursion.
--
-- Idempotent and safe to re-run (including in the Supabase SQL editor).

-- ---------------------------------------------------------------------------
-- Bucket: public read, so getPublicUrl() links render in the shop.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------------
-- Policies on storage.objects, scoped to this bucket only.
-- ---------------------------------------------------------------------------

drop policy if exists "service_images_public_read" on storage.objects;
create policy "service_images_public_read" on storage.objects
  for select using (bucket_id = 'service-images');

drop policy if exists "service_images_organizer_insert" on storage.objects;
create policy "service_images_organizer_insert" on storage.objects
  for insert with check (bucket_id = 'service-images' and public.is_organizer());

drop policy if exists "service_images_organizer_update" on storage.objects;
create policy "service_images_organizer_update" on storage.objects
  for update using (bucket_id = 'service-images' and public.is_organizer())
  with check (bucket_id = 'service-images' and public.is_organizer());

drop policy if exists "service_images_organizer_delete" on storage.objects;
create policy "service_images_organizer_delete" on storage.objects
  for delete using (bucket_id = 'service-images' and public.is_organizer());
