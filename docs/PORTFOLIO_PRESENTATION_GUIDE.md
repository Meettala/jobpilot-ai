# Portfolio Presentation Guide

## What to show

Present JobPilot AI as a **safety-first, evidence-grounded job application assistant**, not as an autonomous application bot.

A strong 45–60 second demonstration should show:

1. Open `/analyse`.
2. Paste a short synthetic CV containing Python and pandas experience.
3. Paste a synthetic job description requiring Python and Kubernetes.
4. Run the analysis.
5. Show that Python is matched and Kubernetes is reported as missing.
6. Show that the cover letter uses only CV evidence and does not claim Kubernetes.
7. Open `/jobs`.
8. Add a suggested action to the pending approval queue.
9. Show that nothing changes before approval.
10. Approve or reject the item and explain the limited result.

Do not use a real CV, real employer application or private recruiter message in a public recording.

## Screenshot checklist

Capture two clean screenshots:

- **Analysis screen:** match score, matched/missing evidence and truthful cover letter visible.
- **Tracker screen:** pending approval card with Approve and Reject controls visible.

Before capturing:

- Use synthetic names and companies.
- Remove browser bookmarks and personal tabs.
- Use a desktop viewport around 1440 × 900.
- Ensure no API keys, console errors or private data are visible.

## Suggested portfolio summary

> Built a safety-first Next.js job application assistant that grounds CV claims in source evidence, blocks unsupported skills, validates optional provider output against an evidence allow-list, and requires explicit approval before tracker state changes. Added TypeScript, Vitest, CI, OSV dependency scanning, Docker and security documentation.

## Suggested CV bullet points

- Built an evidence-grounded Next.js and TypeScript job assistant for CV-to-job matching, skill-gap analysis, truthful cover letters, interview preparation and LinkedIn suggestions.
- Designed a non-generative default drafting path where every cover-letter claim is traceable to exact CV evidence.
- Hardened optional OpenAI/Anthropic output with strict schemas, allow-listed evidence IDs, timeouts, escaped delimiters and deterministic fallback.
- Implemented an approval-gated application tracker with duplicate suppression, replay protection and no automated recruiter messaging.
- Added Vitest regression tests, GitHub Actions, Google OSV scanning and a non-root Docker deployment.

## Suggested interview explanation

Use this structure:

1. **Problem:** Job assistants may fabricate candidate experience or automate sensitive actions too aggressively.
2. **Design:** Build an evidence bank first, then allow downstream outputs to use only traceable evidence.
3. **Safety:** Keep the default path deterministic; let optional providers rank evidence rather than author unrestricted claims.
4. **Approval:** Separate suggestions, pending queue items and explicit state-changing decisions.
5. **Limitations:** Taxonomy-based extraction, in-memory demo storage and unwired Supabase/n8n production controls.
6. **Future work:** Authenticated persistence, tested RLS, signed automation requests and browser-level tests.

## GitHub finishing steps

After deployment:

1. Add the live demo URL to the repository About section.
2. Upload a PNG version of `docs/assets/social-preview.svg` in repository settings.
3. Add genuine screenshots to `docs/assets/` and embed them in the README.
4. Add a short demo-video link.
5. Pin the repository on the GitHub profile.

Do not add fake screenshots, fake user metrics, invented customers or claims that Supabase/n8n are already production-connected.
