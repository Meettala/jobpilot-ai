# Commercial and Private-Production Boundary

This public repository is a portfolio demonstration of safety-first product and engineering decisions. It is not the correct place for customer data, proprietary ranking logic, paid integrations or production credentials.

## Appropriate for this public repository

- Synthetic CV and job-description examples.
- Deterministic evidence extraction and matching.
- Evidence-grounded cover-letter demonstrations.
- Propose-only tracker and approval-queue logic.
- Tests, CI, Docker and architecture documentation.
- Proposed Supabase and n8n design examples without secrets.

## Move to a separate private repository before commercial use

- Real customer CVs and application histories.
- Authentication, billing and tenant administration.
- Supabase project configuration and service credentials.
- Provider budgets, quotas and proprietary prompts or evaluation sets.
- Job-board, email, calendar, LinkedIn or recruiter integrations.
- Signed n8n endpoints, workflow credentials and audit infrastructure.
- Legal, privacy, retention, deletion and data-processing controls.
- Production monitoring, incident response, backups and migrations.

## Human-control requirement

Even in a private production version, external applications and recruiter messages should remain human-reviewed and auditable. The product should not silently submit applications, invent candidate experience or represent a user without explicit consent.

## Claims boundary

Do not market the public project as guaranteeing interviews, sponsorship, employment, complete skill extraction, legal compliance or protection from every possible prompt-injection technique.
