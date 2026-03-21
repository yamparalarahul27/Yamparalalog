create extension if not exists pgcrypto;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  category text not null default 'Other',
  source text not null default 'Web',
  notes text not null default '',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists resources_saved_at_idx on public.resources (saved_at desc);
create index if not exists resources_category_idx on public.resources (category);
create index if not exists resources_source_idx on public.resources (source);

alter table public.resources enable row level security;

drop policy if exists "Public read resources" on public.resources;
create policy "Public read resources"
on public.resources
for select
using (true);

drop policy if exists "Public insert resources" on public.resources;
create policy "Public insert resources"
on public.resources
for insert
with check (true);

drop policy if exists "Public update resources" on public.resources;
create policy "Public update resources"
on public.resources
for update
using (true)
with check (true);

drop policy if exists "Public delete resources" on public.resources;
create policy "Public delete resources"
on public.resources
for delete
using (true);
