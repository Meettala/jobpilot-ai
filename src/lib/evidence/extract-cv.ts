/**
 * Builds an "evidence bank" from CV text: each item is a skill claim tied
 * to the actual sentence it came from, with a confidence label. This is
 * the foundation the whole app's honesty guarantee rests on — nothing
 * downstream (matching, cover letters, blocked claims) is allowed to
 * assert a skill that isn't traceable back to an evidence item here.
 */

import { findSkillMentions } from "./taxonomy";

export type EvidenceItem = {
  id: string;
  skill: string;
  claim: string;
  evidenceText: string; // the CV sentence/line this came from
  sourceTitle: string; // which CV section it was found in, if detectable
  confidence: "high" | "medium" | "low";
};

const SECTION_HEADERS = [
  "experience", "work experience", "employment", "projects", "education",
  "skills", "certifications", "summary",
];

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

function detectSection(sentence: string, sections: { header: string; index: number }[], globalIndex: number): string {
  let current = "General";
  for (const s of sections) {
    if (s.index <= globalIndex) current = s.header;
    else break;
  }
  return current;
}

export function buildEvidenceBank(cvText: string): EvidenceItem[] {
  const lower = cvText.toLowerCase();
  const sections = SECTION_HEADERS
    .map((h) => ({ header: h, index: lower.indexOf(h) }))
    .filter((s) => s.index !== -1)
    .sort((a, b) => a.index - b.index);

  const sentences = splitIntoSentences(cvText);
  const items: EvidenceItem[] = [];
  const seenSkills = new Set<string>();

  let charOffset = 0;
  for (const sentence of sentences) {
    const idx = cvText.indexOf(sentence, charOffset);
    charOffset = idx >= 0 ? idx : charOffset;
    const section = detectSection(sentence, sections, charOffset);

    const mentions = findSkillMentions(sentence);
    for (const { skill, evidence } of mentions) {
      // A skill can appear in multiple sentences; keep the strongest
      // (longest, most specific) evidence sentence for each skill,
      // rather than flooding the bank with duplicates.
      const key = skill;
      const existing = items.find((i) => i.skill === key);
      const confidence = classifyConfidence(sentence, section);
      if (!existing || sentence.length > existing.evidenceText.length) {
        const item: EvidenceItem = {
          id: existing?.id ?? `ev_${items.length}`,
          skill,
          claim: `Has experience with ${skill}`,
          evidenceText: sentence,
          sourceTitle: section,
          confidence,
        };
        if (existing) {
          const i = items.findIndex((it) => it.skill === key);
          items[i] = item;
        } else {
          items.push(item);
          seenSkills.add(evidence);
        }
      }
    }
  }

  return items;
}

function classifyConfidence(sentence: string, section: string): "high" | "medium" | "low" {
  const lower = sentence.toLowerCase();
  const hasNumber = /\d/.test(sentence);
  const strongSections = ["experience", "work experience", "employment", "projects"];
  const actionVerbs = ["built", "developed", "led", "designed", "implemented", "deployed", "created", "shipped", "trained", "analyzed"];
  const hasActionVerb = actionVerbs.some((v) => lower.includes(v));

  if (strongSections.includes(section) && hasActionVerb) return "high";
  if (strongSections.includes(section) || hasNumber) return "medium";
  return "low";
}
