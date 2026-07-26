# Security Policy

## Supported version

Security fixes are applied to the latest commit on `main`.

## Report a vulnerability

Do not open a public issue containing private CVs, API keys, access tokens, Supabase credentials or exploit details. Use GitHub's private vulnerability-reporting feature when available.

Include the affected route or file, reproduction steps, expected impact and a safe proof of concept. Remove personal data before sharing evidence.

## Core trust boundaries

- CV text, job descriptions, workflow payloads and provider output are untrusted.
- The default cover-letter path is deterministic and evidence-only.
- Optional providers may select only allow-listed evidence IDs; they do not author unrestricted final claims.
- Approval-queue items remain inert until an explicit user decision.
- The public demo has no auto-apply, recruiter messaging or live-CV mutation capability.
- Supabase SQL and n8n files are reference integration assets and are not wired into the public demo.

## Secrets and privacy

Keep provider keys and infrastructure credentials in server-side environment variables. Never commit real CVs, application histories or recruiter communications. The in-memory tracker is demonstration data and resets when the server restarts.

## Out of scope claims

This portfolio project is not presented as a production hiring platform, a guaranteed prompt-injection defence, legal advice, immigration advice or a guarantee of interviews or employment.
