# AI Handoff — JobPilot AI

> Paste this file into another AI assistant to continue the project without restarting it. Always verify the live repository, active pull requests, branch head, dependencies and CI before editing.

## Continuation instruction

You are continuing `Meettala/jobpilot-ai`, a public portfolio project owned by Meet Tala.

Do not weaken the evidence-bank architecture, blocked-claims guarantee, explicit user-approval boundary, non-auto-apply product scope or prompt-injection protections. Inspect the live code, tests, README, security documentation, Supabase schema and n8n files before changing behaviour. Add tests for material changes and update this file after code, security, dependency, deployment, documentation or portfolio work.

Never commit API keys, private CVs, job applications, recruiter messages, Supabase credentials, customer data or confidential production infrastructure.

## Repository state

- Default branch: `main`
- Working branch: `agent/professional-repository-foundation`
- Starting commit: `4181209c09238b0f1bb0d5144eb701adbdd2688a`
- Existing pull requests before this work: none
- Visibility: public
- Stack described by the starting README: Next.js, React, TypeScript, Vitest, optional OpenAI/Anthropic, Supabase schema and n8n workflow documentation
- Last updated: 26 July 2026

## Product purpose

JobPilot AI analyses a CV against a job description, builds an evidence bank, produces a match report, drafts a truthful cover letter, generates interview questions and LinkedIn suggestions, and supports an application tracker.

The default cover-letter path is structurally non-generative: it may only assemble claims already present in the CV evidence bank. Optional provider output must remain subordinate to the same blocked-claims guarantee.

The project is not an auto-apply bot. It must not submit applications, message recruiters or alter live CVs without explicit user action and separate governed integrations.

## Initial audit plan

1. Inspect evidence extraction, scoring, cover-letter, interview, LinkedIn, export, API, UI, tracker, Supabase and n8n files.
2. Establish deterministic CI for install, TypeScript, ESLint, Vitest, production build and dependency scanning.
3. Verify the stated structural no-invented-claims property with positive and negative tests.
4. Harden optional provider parsing, citation/evidence allow-listing, timeouts and safe fallback.
5. Validate API request shapes, size limits, malformed JSON, non-string values and safe errors.
6. Audit tracker state transitions, explicit approval requirements, stale actions and idempotency.
7. Review Supabase row-level-security policies and document that they are not yet wired to the public demo.
8. Review n8n workflow safety, credentials, approval gates and webhook assumptions.
9. Improve accessible UI, transparent mode labels, privacy warnings and recruiter-facing presentation.
10. Add Docker/deployment support, governance, architecture, threat model, roadmap and commercial boundary documentation.
11. Add portfolio assets, presentation guide and final recruiter/security review.
12. Keep the pull request draft until every final quality and security gate passes on the exact head.
13. Squash-merge only after the project is genuinely portfolio-ready.

## Decisions to preserve

- Claims must be traceable to CV evidence.
- Missing or weak evidence must be disclosed rather than invented.
- Default cover-letter drafting remains non-generative.
- Optional provider output is untrusted and cannot bypass the evidence allow-list.
- Job-description text, CV text and workflow payloads are untrusted data.
- User approval is required before any tracker state change or external action.
- The public project must not claim autonomous applications, guaranteed interviews or guaranteed employment outcomes.
- Future paid production work belongs in a separate private governed repository.
