-- RaiseKit — Supabase Schema
-- Paste this into your Supabase project → SQL Editor → New query → Run.
--
-- This creates the two tables RaiseKit needs.
-- Row Level Security (RLS) is disabled here for simplicity because
-- the server uses the service_role key which bypasses RLS anyway.
-- For extra defence-in-depth you can enable RLS and add policies.

-- ── Users ──────────────────────────────────────────────────────────────────
-- Note: this is a custom users table using bcrypt-hashed passwords.
-- It is separate from Supabase Auth (auth.users), which is not used.

CREATE TABLE IF NOT EXISTS public.users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  password   TEXT        NOT NULL,  -- bcrypt hash, never plaintext
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Playbooks ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.playbooks (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_type         TEXT        NOT NULL,
  funding_goal     TEXT        NOT NULL,
  time_horizon     TEXT        NOT NULL,
  funding_priority TEXT        NOT NULL,
  mission          TEXT,
  current_stage    TEXT,
  strategy_summary TEXT        NOT NULL,
  today_actions    TEXT        NOT NULL,  -- JSON array stored as text
  timeline         TEXT        NOT NULL,  -- JSON array stored as text
  donor_outreach   TEXT        NOT NULL,
  grant_ideas      TEXT        NOT NULL,  -- JSON array stored as text
  checklist        TEXT        NOT NULL,  -- JSON array stored as text
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user playbook lookups
CREATE INDEX IF NOT EXISTS playbooks_user_id_idx ON public.playbooks(user_id);
