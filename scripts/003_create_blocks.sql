-- Create blocks table for page content
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'paragraph',
  content text not null default '',
  position integer not null default 0,
  properties jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists blocks_page_id_idx on public.blocks(page_id);
create index if not exists blocks_user_id_idx on public.blocks(user_id);

-- Enable RLS
alter table public.blocks enable row level security;

-- RLS Policies
create policy "Users can view blocks of their own pages"
  on public.blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert blocks to their own pages"
  on public.blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own blocks"
  on public.blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own blocks"
  on public.blocks for delete
  using (auth.uid() = user_id);
