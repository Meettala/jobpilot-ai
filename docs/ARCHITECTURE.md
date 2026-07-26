# Architecture

## Purpose

JobPilot AI is a portfolio-grade, evidence-grounded job application assistant. It analyses a CV against a job description, identifies matched and missing skills, drafts a truthful cover letter, prepares interview questions and LinkedIn suggestions, and proposes tracker actions for explicit user approval.

## Trust boundaries

1. **Browser input** — CV text, job descriptions and tracker decisions are untrusted.
2. **Request validation** — API routes reject malformed JSON, unexpected fields, invalid enums, blank strings and oversized inputs.
3. **Deterministic evidence layer** — CV text is split into evidence items tied to exact source sentences.
4. **Scoring layer** — matching compares the shared skill taxonomy across CV and job-description evidence.
5. **Cover-letter boundary** — the default path assembles only real evidence sentences. Optional providers may select allow-listed evidence IDs but do not author unrestricted final claims.
6. **Approval boundary** — tracker suggestions remain pending until an explicit approve or reject request. Replayed decisions are rejected.
7. **Persistence boundary** — the public demo uses an in-memory store. Supabase schema and RLS files are design artefacts and are not connected to the public UI.
8. **Automation boundary** — the n8n example only reads suggestions and creates pending queue items. It has no messaging node or recruiter credential.

## Main flow

```text
CV text ──> evidence extraction ──> evidence bank ──┐
                                                    ├─> matching ─> report/export
Job description ──> requirement extraction ────────┘
                                                    ├─> deterministic cover letter
                                                    ├─> interview questions
                                                    └─> LinkedIn suggestions

Jobs ─> suggestion engine ─> pending approval queue ─> explicit decision ─> limited state change
```

## Runtime components

- `src/lib/evidence/` — shared taxonomy and evidence extraction.
- `src/lib/scoring/` — matching, interview and LinkedIn suggestions.
- `src/lib/ai/cover-letter.ts` — deterministic drafting and optional provider selection.
- `src/lib/http/request-validation.ts` — strict request boundary helpers.
- `src/lib/tracker/` — in-memory demo jobs, suggestions and approval resolution.
- `src/app/api/` — validated API routes.
- `src/app/analyse/` and `src/app/jobs/` — user interfaces.
- `supabase/` — proposed schema and row-level-security policies.
- `n8n/` — optional propose-only workflow example.

## Deployment

Next.js standalone output is used by the multi-stage Docker image. The runtime container is non-root and does not include source-only build dependencies.

## Deliberate limitations

- CV parsing is text-based rather than document-layout aware.
- Skill extraction uses a curated taxonomy and does not guarantee complete coverage.
- The demo store resets when the server restarts.
- Supabase authentication and persistence are not wired into the public demo.
- n8n endpoints require deployment-specific authentication before real use.
- The system does not auto-apply, send recruiter messages or guarantee employment outcomes.
