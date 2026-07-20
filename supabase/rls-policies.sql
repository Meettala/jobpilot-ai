-- Row Level Security: every table is scoped to auth.uid() so User A can
-- never read or write User B's data. Apply after schema.sql.

alter table profiles enable row level security;
alter table cv_documents enable row level security;
alter table evidence_items enable row level security;
alter table jobs enable row level security;
alter table job_analyses enable row level security;
alter table generated_outputs enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cv documents" on cv_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own evidence items" on evidence_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own jobs" on jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- job_analyses and generated_outputs are scoped indirectly via their job's owner.
create policy "own job analyses" on job_analyses for all
  using (exists (select 1 from jobs where jobs.id = job_analyses.job_id and jobs.user_id = auth.uid()))
  with check (exists (select 1 from jobs where jobs.id = job_analyses.job_id and jobs.user_id = auth.uid()));

create policy "own generated outputs" on generated_outputs for all
  using (exists (select 1 from jobs where jobs.id = generated_outputs.job_id and jobs.user_id = auth.uid()))
  with check (exists (select 1 from jobs where jobs.id = generated_outputs.job_id and jobs.user_id = auth.uid()));

alter table approval_queue enable row level security;
create policy "own approval queue items" on approval_queue for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
