-- JobPilot AI schema
-- Not yet applied to the live Supabase project (dnzdmjqchaupukxafbwi) —
-- tool access was unavailable this session. Apply via the Supabase
-- dashboard SQL editor, or ask Claude to run it via the MCP connector
-- once available again.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  target_roles text,
  location_preference text,
  created_at timestamptz not null default now()
);

create table if not exists cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  raw_text text not null,
  parsed_json jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_document_id uuid references cv_documents(id) on delete cascade,
  source_type text,
  source_title text,
  claim text not null,
  evidence_text text not null,
  confidence text default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  company text,
  location text,
  source_url text,
  job_description text not null,
  status text default 'saved',
  follow_up_date date,
  created_at timestamptz not null default now()
);

create table if not exists job_analyses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  match_score numeric,
  matched_skills jsonb,
  missing_skills jsonb,
  weak_evidence jsonb,
  blocked_claims jsonb,
  recommendations jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists generated_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  output_type text not null,
  content text not null,
  evidence_map jsonb,
  approved_by_user boolean default false,
  created_at timestamptz not null default now()
);

-- Added for Project 7 (Agentic Job Application Tracker).
-- Not yet applied — see PROJECT_STATUS.md.
create table if not exists approval_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  action_type text not null, -- 'draft_follow_up' | 'mark_stale'
  proposed_content text not null,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz not null default now()
);
