-- Apply after schema.sql and before enabling a real multi-user deployment.
-- This file is design documentation for the unwired Supabase production path.

alter table profiles
  add constraint profiles_user_id_unique unique (user_id);

alter table evidence_items
  add constraint evidence_confidence_allowed
  check (confidence in ('high', 'medium', 'low'));

alter table jobs
  add constraint jobs_status_allowed
  check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'closed'));

alter table generated_outputs
  add constraint generated_outputs_type_allowed
  check (output_type in ('cover_letter', 'interview_questions', 'linkedin_suggestions', 'report'));

alter table approval_queue
  add constraint approval_queue_action_allowed
  check (action_type in ('draft_follow_up', 'mark_stale'));

alter table approval_queue
  add constraint approval_queue_status_allowed
  check (status in ('pending', 'approved', 'rejected'));

create unique index if not exists approval_queue_one_pending_action
  on approval_queue (user_id, job_id, action_type)
  where status = 'pending';

create index if not exists cv_documents_user_created_idx
  on cv_documents (user_id, created_at desc);

create index if not exists evidence_items_document_idx
  on evidence_items (cv_document_id);

create index if not exists jobs_user_status_idx
  on jobs (user_id, status);

create index if not exists job_analyses_job_idx
  on job_analyses (job_id, generated_at desc);

create index if not exists generated_outputs_job_idx
  on generated_outputs (job_id, created_at desc);

create index if not exists approval_queue_user_status_idx
  on approval_queue (user_id, status, created_at desc);

-- Production migration requirements not represented by SQL alone:
-- 1. Run RLS tests as two separate authenticated users.
-- 2. Never expose the service-role key to browser code.
-- 3. Add immutable audit records for approval decisions.
-- 4. Define retention and deletion for CV raw_text and generated content.
-- 5. Back up and restore-test before storing real user data.
