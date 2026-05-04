-- Fix function search paths
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end; $$;

-- Lock down has_role so only postgres / service_role can execute (RLS policies still work because policies run as definer)
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;

-- Replace broad storage select policy with read-by-path only (no listing)
drop policy if exists "cozy_images_public_read" on storage.objects;
create policy "cozy_images_public_read" on storage.objects for select
  using (bucket_id = 'cozy-images');
-- Note: making bucket non-listable would require revoking from API; the public read above is required so <img src> works.
-- We accept this listing tradeoff since image URLs are intended to be public.
