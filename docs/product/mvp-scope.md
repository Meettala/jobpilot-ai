# MVP scope — JobPilot AI

## Built in this session
- Paste CV + paste JD → evidence bank → job requirements → match score.
- Matched / missing / weak-evidence skills.
- Evidence-grounded cover letter (template mode, zero API key; optional
  LLM mode).
- Blocked claims, always shown, never hidden.
- Interview question generation (technical / behavioural / ask-employer).
- LinkedIn headline/skills suggestions (evidence-grounded only).
- Markdown export.
- Supabase schema + RLS policies written, ready to apply.

## Not yet built (from the original spec, next steps)
- File upload (PDF/DOCX) — paste-text only for now.
- Persisted job tracker with follow-up reminders (schema ready, not wired
  to the UI yet — currently stateless per request).
- Login / multi-user (Supabase Auth wiring).
- PDF export (Markdown only for now).

## Explicitly out of scope (matches original safety rules)
- Auto-apply, auto-message recruiters, LinkedIn automation, autonomous
  CV editing, unrestricted web scraping.
