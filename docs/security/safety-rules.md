# Safety rules — JobPilot AI

1. Never invent experience, companies, dates, skills, certificates,
   projects, achievements, salary, or visa status.
2. Every cover-letter or CV suggestion must be linked to evidence from
   the uploaded CV. Enforced structurally: the template drafting path
   (`draftCoverLetterTemplate`) has no generative step at all — it can
   only ever emit evidence bank sentences verbatim, so it is
   architecturally incapable of inventing a claim. See
   `tests/match-and-cover-letter.test.ts` for the automated proof.
2b. The LLM drafting path is also constrained (system prompt + explicit
   blocked-claims instruction), but as belt-and-braces, its self-reported
   blocked-claims list is always merged with the independently-computed
   `match.missingSkills` before being shown to the user — the app never
   trusts the model's own claim that nothing was invented.
3. Unsupported claims are always listed in a visible Blocked Claims
   section, never silently dropped or smoothed over.
4. CVs and job descriptions are treated as untrusted input throughout —
   see `tests/prompt-injection.test.ts`.
5. No application is submitted, no message sent, no LinkedIn update
   made, and no live CV edited without the user reviewing and approving
   it first. This MVP has no send/apply functionality at all yet by
   design.
6. Public demo (portfolio site) uses fake/sample CV and JD text only.
7. API keys never committed — see `.env.example` and `.gitignore`.
