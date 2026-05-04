-- ============ ROLES ENUM ============
create type public.app_role as enum ('admin', 'user');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER_ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- security definer role checker
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- ============ APARTMENTS ============
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null default '',
  neighborhood text not null,
  city text not null default 'Douala',
  address text,
  price_per_night integer not null,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  max_guests integer not null default 2,
  area_sqm integer,
  amenities text[] not null default '{}',
  rating numeric(2,1) not null default 4.8,
  review_count integer not null default 0,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.apartments enable row level security;

-- ============ APARTMENT IMAGES ============
create table public.apartment_images (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  storage_path text not null,
  url text not null,
  alt text,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.apartment_images enable row level security;
create index on public.apartment_images(apartment_id);

-- ============ BOOKINGS ============
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apartment_id uuid not null references public.apartments(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  nights integer not null,
  total_price integer not null,
  status booking_status not null default 'pending',
  guest_name text,
  guest_email text,
  guest_phone text,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
create index on public.bookings(user_id);
create index on public.bookings(apartment_id);

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apartment_id uuid references public.apartments(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  author_name text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

-- ============ FAVORITES ============
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, apartment_id)
);
alter table public.favorites enable row level security;

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text,
  body text not null,
  is_from_admin boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

-- ============ SITE IMAGES (CMS) ============
create table public.site_images (
  id uuid primary key default gen_random_uuid(),
  key text unique not null, -- e.g. 'landing_hero'
  storage_path text not null,
  url text not null,
  alt text,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.site_images enable row level security;

-- ============ updated_at TRIGGER FN ============
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger apartments_updated_at before update on public.apartments
  for each row execute function public.tg_set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.tg_set_updated_at();
create trigger site_images_updated_at before update on public.site_images
  for each row execute function public.tg_set_updated_at();

-- ============ AUTO-PROFILE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  -- everyone defaults to 'user' role
  insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles: user can see/update own; admins can see all
create policy "profiles_self_select" on public.profiles for select
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "profiles_self_update" on public.profiles for update
  using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles for insert
  with check (auth.uid() = id);

-- user_roles: users see own; only admins can modify
create policy "user_roles_self_select" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_admin_all" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- apartments: public read; admin write
create policy "apartments_public_select" on public.apartments for select using (true);
create policy "apartments_admin_all" on public.apartments for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- apartment_images: public read; admin write
create policy "apt_images_public_select" on public.apartment_images for select using (true);
create policy "apt_images_admin_all" on public.apartment_images for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- bookings: user CRUD own; admin sees all
create policy "bookings_self_select" on public.bookings for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "bookings_self_insert" on public.bookings for insert
  with check (auth.uid() = user_id);
create policy "bookings_self_update" on public.bookings for update
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "bookings_admin_delete" on public.bookings for delete
  using (public.has_role(auth.uid(), 'admin'));

-- reviews: public read; users insert own; users delete own; admins manage
create policy "reviews_public_select" on public.reviews for select using (true);
create policy "reviews_self_insert" on public.reviews for insert
  with check (auth.uid() = user_id);
create policy "reviews_self_delete" on public.reviews for delete
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- favorites: user CRUD own
create policy "favorites_self_select" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_self_insert" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_self_delete" on public.favorites for delete using (auth.uid() = user_id);

-- messages: user sees own; user inserts own; admin sees all
create policy "messages_self_select" on public.messages for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "messages_self_insert" on public.messages for insert
  with check (auth.uid() = user_id);
create policy "messages_admin_all" on public.messages for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- site_images: public read; admin write
create policy "site_images_public_select" on public.site_images for select using (true);
create policy "site_images_admin_all" on public.site_images for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE BUCKET ============
insert into storage.buckets (id, name, public)
values ('cozy-images', 'cozy-images', true)
on conflict (id) do nothing;

-- public can read images
create policy "cozy_images_public_read" on storage.objects for select
  using (bucket_id = 'cozy-images');

-- only admins can upload/update/delete via the API
create policy "cozy_images_admin_write" on storage.objects for insert
  with check (bucket_id = 'cozy-images' and public.has_role(auth.uid(), 'admin'));
create policy "cozy_images_admin_update" on storage.objects for update
  using (bucket_id = 'cozy-images' and public.has_role(auth.uid(), 'admin'));
create policy "cozy_images_admin_delete" on storage.objects for delete
  using (bucket_id = 'cozy-images' and public.has_role(auth.uid(), 'admin'));
