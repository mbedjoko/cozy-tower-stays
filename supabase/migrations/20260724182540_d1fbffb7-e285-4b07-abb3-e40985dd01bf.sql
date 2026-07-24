-- ============ SOCIAL POSTS (curated Facebook / Instagram / TikTok embeds) ============
create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok')),
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;

-- public read; admin write
create policy "social_posts_public_select" on public.social_posts for select using (true);
create policy "social_posts_admin_all" on public.social_posts for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
