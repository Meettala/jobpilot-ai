# JobPilot AI

A safety-first job application assistant that compares CV evidence with a job description, explains skill gaps, drafts an evidence-grounded cover letter, prepares interview questions and LinkedIn suggestions, and proposes application-tracker actions for explicit user approval.

> **Not an auto-apply bot.** The public project does not submit applications, send recruiter messages, edit a live CV or guarantee employment outcomes.

## Why this project is different

Many job assistants rely on a prompt that asks a model not to invent experience. JobPilot uses a stronger structural boundary:

- CV skills are tied to exact source sentences in an evidence bank.
- The default cover-letter path has no generative step.
- Every cover-letter body sentence is assembled from real CV evidence.
- Missing requirements are disclosed as blocked claims.
- Optional providers may rank valid evidence IDs, but cannot author unrestricted final claims.
- Invalid provider output falls back to the deterministic path.

The guarantee is covered by automated tests for unsupported skills, malformed provider JSON, unknown evidence IDs, prompt-shaped CV text, delimiter injection and provider failures.

## Features

### CV and job analysis

- Shared skill taxonomy for CV and job-description extraction.
- Required, preferred, matched, missing and weak-evidence skills.
- Explainable match score and Markdown report export.
- Interview questions derived from job requirements.
- LinkedIn suggestions limited to evidence-backed skills.

### Truthful cover letters

- Deterministic zero-key mode.
- Optional OpenAI or Anthropic evidence selection.
- Strict provider schema and evidence-ID allow-list.
- Escaped untrusted-document delimiters.
- 15-second provider timeout and safe fallback.

### Application tracker

- Follow-up and stale-application suggestions.
- Pending approval queue.
- No state change before explicit approval.
- Rejected actions never execute.
- Replayed approvals return `409 Conflict`.
- Follow-up approval creates a draft only; there is no send integration.

## Architecture

```text
CV text ──> evidence extraction ──> evidence bank ──┐
                                                    ├─> skill matching ─> report
Job description ──> requirement extraction ────────┘
                                                    ├─> deterministic cover letter
                                                    ├─> interview questions
                                                    └─> LinkedIn suggestions

Jobs ─> side-effect-free suggestions ─> pending queue ─> explicit decision ─> limited state change
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS
- Vitest
- Optional OpenAI or Anthropic HTTP APIs
- Proposed Supabase schema and row-level-security policies
- Optional propose-only n8n workflow example
- Docker standalone deployment
- GitHub Actions and Google OSV Scanner

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open:

- `http://localhost:3000/analyse` — CV and job analysis
- `http://localhost:3000/jobs` — application tracker

The default application works without an API key. Provider-assisted evidence selection is optional:

```bash
OPENAI_API_KEY=your_key
# or
ANTHROPIC_API_KEY=your_key
```

Never commit `.env` files or real CV content.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI performs deterministic installation, TypeScript checking, zero-warning ESLint, all Vitest tests, a production build and OSV dependency scanning.

## Docker

```bash
docker build -t jobpilot-ai .
docker run --rm -p 3000:3000 jobpilot-ai
```

The image uses Next.js standalone output and runs as a non-root user.

## Data and automation status

The public demo uses an in-memory tracker store that resets on server restart. The files under `supabase/` are proposed production persistence and RLS designs; they are not connected to the public interface.

The n8n example only reads suggestions and writes pending approval items. Before any real deployment, protect those endpoints with signed or secret-authenticated requests, HTTPS, rate limiting and audit logging. The workflow deliberately contains no email, LinkedIn, application-submission or recruiter-messaging node.

## Security and privacy

- Treat CVs, job descriptions and workflow payloads as untrusted.
- Do not upload confidential CVs to a public deployment.
- Keep provider and Supabase secrets server-side.
- Test row-level security with separate user accounts before enabling persistence.
- Define retention, deletion and export controls before storing personal data.

Security details: [`SECURITY.md`](SECURITY.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/security/safety-rules.md`](docs/security/safety-rules.md)
- [`docs/security/privacy-by-design.md`](docs/security/privacy-by-design.md)
- [`docs/security/safety-rules-tracker.md`](docs/security/safety-rules-tracker.md)
- [`docs/testing/prompt-injection-tests.md`](docs/testing/prompt-injection-tests.md)
- [`n8n/README.md`](n8n/README.md)
- [`AI_HANDOFF.md`](AI_HANDOFF.md)

## Honest limitations

- Text extraction is taxonomy-based and may miss uncommon or ambiguous skills.
- Match scores are decision support, not hiring predictions.
- Cover-letter output still requires human review for tone and context.
- The tracker is an in-memory demonstration, not production persistence.
- Supabase and n8n files require authentication, operational controls and deployment testing.
- The project does not claim complete prompt-injection immunity, legal compliance certification or guaranteed job results.

## Licence

MIT — see [`LICENSE`](LICENSE).
