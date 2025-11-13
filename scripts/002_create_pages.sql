-- Create pages table with hierarchical structure
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.pages(id) on delete cascade,
  title text not null default 'Untitled',
  icon text,
  cover_image text,
  is_archived boolean default false,
  position integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists pages_user_id_idx on public.pages(user_id);
create index if not exists pages_parent_id_idx on public.pages(parent_id);

-- Enable RLS
alter table public.pages enable row level security;

-- RLS Policies
create policy "Users can view their own pages"
  on public.pages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own pages"
  on public.pages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pages"
  on public.pages for update
  using (auth.uid() = user_id);

create policy "Users can delete their own pages"
  on public.pages for delete
  using (auth.uid() = user_id);
