# Roadmap

## Portfolio release — current scope

- Evidence-grounded CV and job-description analysis.
- Deterministic cover-letter drafting.
- Optional provider-assisted evidence selection with strict validation.
- Match, missing-skill and weak-evidence reporting.
- Interview and LinkedIn suggestions.
- In-memory application tracker with explicit approval queue.
- Markdown export, tests, CI, OSV scanning and Docker support.

## Next public-demo improvements

- Add accessible sample-data buttons and clearer privacy guidance.
- Add genuine screenshots and a short demonstration video.
- Expand taxonomy tests and improve synonym handling.
- Add an authenticated, rate-limited automation endpoint example.
- Add browser-level tests for the analyse and tracker journeys.

## Private production track

The following work should be developed in a separate private repository before real-user deployment:

- Supabase authentication and persistent storage.
- Tested row-level security with multiple users.
- Encrypted secret management and provider usage controls.
- Personal-data retention, deletion and export workflows.
- Signed n8n requests, rate limiting, audit logs and replay protection.
- Observability, backups, migrations and incident response.
- Human review before any external communication.
- Legal and platform-policy review for job-source integrations.

## Explicitly excluded

- Autonomous job applications.
- Automated recruiter messaging.
- Automatic editing of a live CV.
- Fabricated experience or skill claims.
- Guaranteed interviews, sponsorship or employment outcomes.
