# Contributing

Thank you for improving JobPilot AI.

## Before opening a change

- Read `README.md`, `SECURITY.md`, `docs/ARCHITECTURE.md` and `docs/THREAT_MODEL.md`.
- Preserve the evidence-bank and blocked-claims guarantees.
- Do not add autonomous applications, recruiter messaging or live-CV editing to the public demo.
- Do not commit real CVs, job applications, API keys, Supabase credentials or n8n secrets.

## Development

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Material behaviour changes require tests. Security-sensitive changes should include negative tests for malformed input, unsupported claims, approval bypass or replay.

## Pull requests

A pull request should explain:

- the user problem,
- the trust boundary affected,
- tests added or updated,
- documentation changes,
- known limitations,
- whether the change affects optional providers, approval actions, Supabase or n8n.

## Safety requirements

- Keep final cover-letter claims traceable to real evidence items.
- Treat provider responses and document text as untrusted.
- Reject unknown fields and invalid runtime values at API boundaries.
- Require explicit approval before any state-changing tracker action.
- Keep the public workflow propose-only.
- Never weaken security checks merely to make CI pass.

## Reporting security issues

Do not open a public issue for a vulnerability involving private data, authentication, secret exposure or approval bypass. Follow `SECURITY.md` instead.
