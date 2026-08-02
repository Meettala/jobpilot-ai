# Future Improvement: Universal CV-to-Job Matching

## Status

The cross-role scoring bug was fixed and merged in PR #2 (`9bfae514676c80cda83c831a1c5332cedcd2b236`). CI run #53 passed before merge.

The current system now distinguishes strong, partial, weak and likely occupational-mismatch results, weights CV evidence by confidence and prevents one generic skill from producing a false 100% match.

However, universal matching for every occupation is not complete. Current extraction still depends substantially on the curated skill taxonomy. Unfamiliar roles, specialist duties, rare licences and unusual wording may therefore be missed.

Do not claim that JobPilot currently works perfectly for every CV and job description.

## Required next architecture

The next major improvement must generalise requirement extraction instead of adding individual jobs one by one.

For any job description, extract:

- core duties and responsibilities;
- mandatory and preferred experience;
- qualifications and education;
- licences, registrations and certifications;
- tools, technologies and equipment;
- physical and operational requirements;
- shift, availability, travel and location requirements;
- language, communication and behavioural requirements.

For any CV, identify exact evidence for each extracted requirement.

Each requirement must receive one state:

1. Confirmed evidence.
2. Weak or indirect evidence.
3. Missing evidence.
4. Unable to assess reliably.

## Scoring and safety requirements

- Score validated extracted requirements, not only taxonomy entries.
- Weight mandatory duties more heavily than optional preferences.
- Prevent generic Communication or Teamwork evidence from creating a high score by itself.
- Detect occupational mismatch when core duties are unsupported.
- Expose analysis coverage/confidence separately from candidate match score.
- Show `Insufficient analysis coverage` when too little of the job description was understood.
- Preserve exact CV evidence for every positive claim.
- Keep missing requirements as blocked claims.
- Never let an optional AI provider invent evidence or bypass schema validation.
- Keep a deterministic no-key fallback and clearly disclose its limitations.
- Continue treating CV and job-description text as untrusted input.

## Suggested implementation

Use a hybrid pipeline:

1. Deterministic parsing of headings, bullets and requirement markers.
2. Optional provider-assisted extraction into a strict validated schema.
3. Canonicalisation and deduplication of requirements.
4. Retrieval of relevant CV sentences and sections.
5. Requirement-level evidence classification.
6. Analysis-coverage calculation.
7. Deterministic scoring from validated structured data only.

The optional provider should return structured classifications or evidence selections, not unrestricted final claims.

## Required evaluation

Build a labelled synthetic evaluation set covering unrelated sectors, including software, data, healthcare, care, construction, trades, hospitality, retail, logistics, finance, education, administration, engineering, manufacturing, design and laboratory work.

Include strong matches, partial matches, weak matches, occupational mismatches, unfamiliar wording, missing licences, generic transferable-skill overlap, prompt-injection text and low-coverage cases.

Candidate names must never influence scoring. Do not tune the system only to Priya Shah, Event Crew or any other single example.

## Definition of done

This milestone is complete only when:

- extraction works beyond the fixed taxonomy;
- every verdict includes requirement-level evidence;
- analysis coverage is displayed separately;
- low-coverage inputs cannot receive confident high scores;
- the broad labelled evaluation set passes;
- TypeScript, ESLint, tests, production build and OSV scanning pass;
- documentation and `AI_HANDOFF.md` are updated;
- the pull request is merged only after green CI.
