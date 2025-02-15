
-- Create an enum for content sources
create type content_source as enum ('forum', 'whatsapp', 'twitter');

-- Create a table for storing moderation history
create table moderation_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  content_text text not null,
  content_source content_source not null,
  is_flagged boolean not null default false,
  flag_reason text,
  created_at timestamp with time zone default now(),
  external_message_id text -- For linking back to original messages
);

-- Enable RLS
alter table moderation_history enable row level security;

-- Create policy to allow users to see only their own history
create policy "Users can view their own moderation history"
  on moderation_history for select
  using (auth.uid() = user_id);

-- Create policy to allow insert
create policy "Users can insert their own moderation history"
  on moderation_history for insert
  with check (auth.uid() = user_id);
