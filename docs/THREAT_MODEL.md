# Threat Model

## Protected assets

- Private CV and application text.
- Provider API keys and deployment credentials.
- Evidence-to-claim traceability.
- User-controlled approval decisions.
- Job and application state.
- Supabase tenant separation if persistence is later enabled.

## Primary threats and controls

### Fabricated candidate claims

**Threat:** A provider or hostile document causes unsupported skills or achievements to appear in a cover letter.

**Controls:**

- The default drafting path is non-generative.
- Evidence items retain exact source text.
- Optional providers can only select allow-listed evidence IDs.
- The final letter is assembled deterministically from those items.
- Missing requirements are preserved as blocked claims.
- Provider output has a strict schema, bounded values and safe fallback.

### Prompt injection through CV or job-description text

**Threat:** Embedded instructions attempt to override system behaviour.

**Controls:**

- The deterministic path has no model to instruct.
- Provider evidence delimiters are escaped.
- Untrusted content is explicitly separated from instructions.
- Provider output cannot execute code, SQL, network actions or arbitrary workflow steps.

### Malformed or oversized requests

**Threat:** Invalid JSON, unexpected fields or very large strings cause crashes or resource abuse.

**Controls:**

- Shared strict request validators.
- Object-only JSON parsing.
- Unexpected-field rejection.
- Bounded, trimmed strings and runtime enum validation.
- Generic server errors without internal details.

### Approval bypass or replay

**Threat:** A pending suggestion changes state without a user decision, or an approved item is replayed.

**Controls:**

- Suggestion generation is side-effect free.
- Creating a queue item never changes job state.
- Only explicit approval can perform the limited `mark_stale` transition.
- Rejected items never act.
- Already-resolved items return `409 Conflict` and cannot fire again.
- Follow-up approval produces a draft only; no send integration exists.

### Cross-user data access

**Threat:** One authenticated user accesses another user’s CV, jobs or generated outputs after Supabase is enabled.

**Controls and requirements:**

- Proposed tables include `user_id` ownership.
- Row-level security is enabled for every user-owned table.
- Indirect job-owned records use ownership subqueries.
- Production rollout must test RLS with separate user accounts before storing real data.
- Service-role keys must never be exposed to the browser.

### n8n endpoint abuse

**Threat:** An unauthorised caller fills the approval queue or reads job suggestions.

**Current status:** The repository contains a workflow example, not a production integration.

**Production requirements:**

- Protect automation endpoints with a secret or signed request.
- Rate-limit calls and log request IDs.
- Restrict the workflow to HTTPS deployment URLs.
- Rotate n8n credentials and never store them in the workflow JSON.
- Keep messaging, application submission and recruiter credentials out of the propose-only workflow.

### Secret or personal-data leakage

**Controls:**

- No keys or real CVs belong in the repository.
- Environment files are ignored.
- Logs use generic provider-failure messages.
- The public demo should use synthetic example content.
- Production retention, deletion and export policies must be defined before storing personal data.

## Out of scope for the public demo

The repository does not claim to provide production authentication, persistent multi-user storage, autonomous applications, recruiter messaging, legal compliance certification or guaranteed job outcomes.
