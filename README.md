# JobPilot AI

An evidence-grounded job application assistant. It analyses a CV against
a job description, drafts a truthful cover letter, and — critically —
lists anything it can't back up with evidence instead of inventing it.

**Not an auto-apply bot.** It drafts, analyses, ranks, and reminds. It
never submits applications, messages recruiters, or edits your live CV.

## The core guarantee

The default cover-letter path (`draftCoverLetterTemplate` in
`src/lib/ai/cover-letter.ts`) has **no generative step** — it can only
ever assemble sentences that already exist verbatim in your CV's
evidence bank. This isn't a prompt instruction that could be bypassed;
it's structurally impossible for this code path to invent a claim. See
`tests/match-and-cover-letter.test.ts` for the automated proof.

An optional LLM-drafting mode (better prose, same guarantee) activates
automatically once `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set.

## Architecture

- `src/lib/evidence/taxonomy.ts` — shared skill taxonomy (same approach
  as the Job Market Skill Analyzer).
- `src/lib/evidence/extract-cv.ts` — builds an evidence bank: every skill
  claim tied to its actual source sentence and a confidence label.
- `src/lib/evidence/extract-jd.ts` — extracts required/preferred skills
  from a job description.
- `src/lib/scoring/match.ts` — matched / missing / weak-evidence + score.
- `src/lib/ai/cover-letter.ts` — template (default) and optional LLM
  drafting, both blocked-claims-enforced.
- `src/lib/scoring/interview.ts` — interview question generation.
- `src/lib/scoring/linkedin.ts` — LinkedIn suggestions (evidence-only).
- `src/lib/export/markdown.ts` — full report export.
- `src/app/api/analyse/route.ts` + `src/app/analyse/page.tsx` — the app.
- `supabase/schema.sql` + `supabase/rls-policies.sql` — ready to apply
  when persistence is wired up (not yet connected to the UI).

## Run it

```bash
npm install
npm run dev              # http://localhost:3000/analyse
```

## Tests

```bash
npx vitest run
```

11 tests: evidence extraction, requirement extraction, matching, the
core blocked-claims/honesty guarantee, and prompt-injection resistance.

## Docs

- [`docs/security/safety-rules.md`](docs/security/safety-rules.md)
- [`docs/security/privacy-by-design.md`](docs/security/privacy-by-design.md)
- [`docs/testing/prompt-injection-tests.md`](docs/testing/prompt-injection-tests.md)
- [`docs/product/mvp-scope.md`](docs/product/mvp-scope.md)

## Application Tracker (Project 7)

Extends the app above with `/jobs`: a tracker that identifies
applications needing follow-up, proposes an action, and requires
explicit approval before any state changes. See
`docs/security/safety-rules-tracker.md` and `n8n/README.md` for the
automation half.

Reuses `generateInterviewQuestions` from the analysis engine directly —
no duplicated logic between the two parts of the app.

```bash
npm run dev   # then visit /jobs
```
