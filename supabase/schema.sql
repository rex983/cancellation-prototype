-- Run in Supabase SQL editor for project xockuiyvxijuzlwlsfbu.
-- Single-row JSON blob store for the cancellation prototype.
-- Wide-open: prototype only, accessed via service role from server actions.

create table if not exists public.prototype_cancel_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS off intentionally; only the server (service role) talks to this table.
alter table public.prototype_cancel_state disable row level security;
