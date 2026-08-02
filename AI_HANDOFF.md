# AI Handoff — JobPilot AI

> Paste this file into another AI assistant to continue the project without restarting it. Always verify the live repository, pull requests, branch head, dependencies and CI before editing.

## Continuation instruction

You are continuing `Meettala/jobpilot-ai`, a public portfolio project owned by Meet Tala.

Do not weaken the evidence-bank architecture, blocked-claims guarantee, explicit user-approval boundary, non-auto-apply scope or prompt-injection protections. Inspect the live code, tests, README, security documentation, Supabase design and n8n files before changing behaviour. Add tests for material changes and update this file after code, security, dependency, deployment, documentation or portfolio work.

Never commit API keys, private CVs, job applications, recruiter messages, Supabase credentials, customer data or confidential production infrastructure.

## Repository state

- Default branch: `main`
- Professionalisation branch: `agent/professional-repository-foundation`
- Pull request: `#1` — Professionalize JobPilot AI
- Starting commit: `4181209c09238b0f1bb0d5144eb701adbdd2688a`
- Final verified application head before this handoff update: `d52048d9ed5c874741b470e0740928114eb63902`
- Visibility: public
- Stack: Next.js 16, React 19, TypeScript, Vitest, optional OpenAI/Anthropic selection, proposed Supabase design and propose-only n8n example
- Last updated: 2 August 2026

## Product purpose

JobPilot AI analyses a CV against a job description, builds an evidence bank, reports matched, missing and weak-evidence skills, drafts a truthful cover letter, generates interview questions and LinkedIn suggestions, and demonstrates an approval-gated application tracker.

It is not an auto-apply bot. The public project does not submit applications, message recruiters, alter live CVs or guarantee interviews or employment.

## Completed professionalisation work

### Evidence and provider safety

- Preserved the structurally non-generative default cover-letter path.
- Every body claim is assembled from exact CV evidence text.
- Missing requirements remain blocked claims.
- Optional providers now select bounded, allow-listed evidence IDs rather than author unrestricted final prose.
- Added strict provider JSON validation, unexpected-field rejection, HTTP checks, 15-second timeouts, escaped evidence delimiters and generic deterministic fallback.
- Added malformed-output, unknown-ID, provider-failure and delimiter-injection tests.
- Hardened one-line job-description title extraction so unrelated requirement sentences are not repeated as the role title.

### API and tracker boundaries

- Added shared strict JSON request validation.
- Analysis API rejects malformed JSON, extra fields, blank values and strings over 50,000 characters.
- Approval API validates action and decision enums at runtime, bounds strings and rejects unknown jobs.
- Duplicate pending actions are suppressed.
- Replayed decisions return `409 Conflict` and cannot trigger state changes again.
- Suggestions remain side-effect free.
- Only explicit approval of `mark_stale` performs a limited state change.
- Follow-up approval remains a draft; no send integration exists.
- Added API-boundary and tracker regression tests.

### Dependencies and CI

- Upgraded Next.js and `eslint-config-next` to `16.2.11`.
- Overrode vulnerable production transitive dependencies to PostCSS `8.5.18` and Sharp `0.35.3`.
- Regenerated and committed the npm lockfile.
- Added read-only GitHub Actions CI for `npm ci`, TypeScript, zero-warning ESLint, Vitest and production build.
- Added Google OSV Scanner v2.3.8.
- Final clean workflow run 43 passed application verification and OSV scanning on head `d52048d9ed5c874741b470e0740928114eb63902`.

### Documented dependency exception

`osv-scanner.toml` ignores only `CVE-2026-14257` for old `brace-expansion` copies pulled by ESLint/minimatch development tooling.

- They are not included in the standalone production runtime.
- The repository does not pass user-controlled glob patterns into that tooling.
- Forcing `brace-expansion` v5 into minimatch v3 breaks ESLint due to incompatible APIs.
- Remove the exception when the upstream lint dependency chain supports `brace-expansion` 5.0.8 or later.

### Deployment and governance

- Added Next.js standalone output and a non-root multi-stage Dockerfile.
- Added `.dockerignore`, MIT `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` and a PR template.
- Added architecture, threat model, roadmap and commercial/private-production boundary documentation.
- Added recruiter-focused README, presentation guide and social-preview SVG.

### Supabase and n8n status

- `supabase/schema.sql`, RLS policies and `constraints.sql` are proposed designs only.
- The public demo still uses an in-memory store and resets on restart.
- Supabase is not connected to the public UI.
- The n8n workflow reads suggestions and creates pending items only.
- The example must remain disabled outside an isolated demo until authentication, signed requests, rate limiting and audit logging are implemented.
- No messaging or application-submission node exists.

## Cross-role scoring update completed

PR #2 was merged on 2 August 2026 with merge commit `9bfae514676c80cda83c831a1c5332cedcd2b236` after CI run #53 passed.

It fixed the false-positive case where a Data Analyst CV received a 100% score for an Event Crew job. The system now reports strong, partial, weak and likely occupational-mismatch verdicts, weights evidence confidence, shows required coverage and prevents one generic skill from proving genuine role fit.

## Important limitation and future roadmap

Universal matching for every occupation is **not yet complete**. The current system still depends substantially on a curated taxonomy, so unfamiliar roles, specialist duties, rare licences and unusual wording may be missed.

Do not claim that JobPilot currently works perfectly for every CV and job description.

The full future architecture, safety requirements, evaluation plan and definition of done are documented in:

`docs/FUTURE_UNIVERSAL_MATCHING_ROADMAP.md`

The next AI must read that file before making further matching changes. The next major improvement should extract open-ended requirements from any job description, map each requirement to exact CV evidence, expose analysis coverage separately from match score and show `Insufficient analysis coverage` when the system cannot understand enough of the input.

## Verified commands

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

The permanent CI also runs OSV Scanner against `package-lock.json`.

## Remaining manual presentation work

Repository engineering is complete once PR #1 is merged after the final handoff-head workflow passes.

Manual portfolio tasks:

1. Deploy the application.
2. Use synthetic CV and employer data.
3. Capture genuine `/analyse` and `/jobs` screenshots.
4. Record a 45–60 second demonstration.
5. Convert `docs/assets/social-preview.svg` to PNG and upload it through GitHub repository settings.
6. Add the live URL and genuine media to the README and portfolio.

See `docs/PORTFOLIO_PRESENTATION_GUIDE.md`.

## Decisions to preserve

- Claims must remain traceable to CV evidence.
- Missing or weak evidence must be disclosed rather than invented.
- Default cover-letter drafting remains non-generative.
- Provider output is untrusted and cannot bypass the evidence allow-list.
- CV, job-description and workflow payloads are untrusted data.
- User approval is required before any tracker state change or external action.
- The public repository must not claim autonomous applications, universal accuracy, guaranteed interviews or guaranteed employment outcomes.
- Real-user commercial work belongs in a separate private governed repository.
