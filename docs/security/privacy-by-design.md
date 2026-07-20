# Privacy by design — JobPilot AI

- This MVP runs in-memory per request — no CV or job description is
  persisted anywhere yet (Supabase schema is written and ready in
  `supabase/schema.sql` + `supabase/rls-policies.sql`, but not yet wired
  up or applied to the live database).
- Once persistence is added: Row Level Security (already scripted) will
  ensure one user can never read another user's CV, evidence, or job
  data — policies scope every table to `auth.uid()`.
- No passport, ID, or right-to-work documents should ever be accepted.
- Public demo uses fake sample CV/JD text only.
