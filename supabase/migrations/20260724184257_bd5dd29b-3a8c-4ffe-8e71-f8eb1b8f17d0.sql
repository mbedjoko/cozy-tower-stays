-- ============ FLYERS (promotional images shown on the About page) ============
create table public.flyers (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.flyers enable row level security;

-- public read; admin write
create policy "flyers_public_select" on public.flyers for select using (true);
create policy "flyers_admin_all" on public.flyers for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
