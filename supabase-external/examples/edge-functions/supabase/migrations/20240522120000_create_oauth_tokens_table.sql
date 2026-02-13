create table if not exists public.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  access_token text not null,
  refresh_token text,
  expires_at bigint,
  created_at timestamptz default now()
);

comment on table public.oauth_tokens is 'Stores OAuth tokens for external integrations.';
