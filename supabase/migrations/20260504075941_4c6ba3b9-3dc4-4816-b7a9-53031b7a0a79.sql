alter table public.reviews alter column user_id drop not null;
-- update insert policy to allow either auth.uid() or admin
drop policy if exists "reviews_self_insert" on public.reviews;
create policy "reviews_self_insert" on public.reviews for insert
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));