/**
 * Builds an evidence bank from CV text. Every extracted skill remains tied
 * to the exact sentence or line that supports it.
 */

import { findSkillMentions } from "./taxonomy";

export type EvidenceItem = {
  id: string;
  skill: string;
  claim: string;
  evidenceText: string;
  sourceTitle: string;
  confidence: "high" | "medium" | "low";
};

const SECTION_HEADERS = [
  "experience",
  "work experience",
  "employment",
  "employment history",
  "projects",
  "selected project",
  "education",
  "skills",
  "core skills",
  "certifications",
  "summary",
  "professional profile",
];

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8);
}

function detectSection(
  sentence: string,
  sections: { header: string; index: number }[],
  globalIndex: number,
): string {
  let current = "General";
  for (const section of sections) {
    if (section.index <= globalIndex) current = section.header;
    else break;
  }
  return current;
}

export function buildEvidenceBank(cvText: string): EvidenceItem[] {
  const lower = cvText.toLowerCase();
  const sections = SECTION_HEADERS
    .map((header) => ({ header, index: lower.indexOf(header) }))
    .filter((section) => section.index !== -1)
    .sort((left, right) => left.index - right.index);

  const sentences = splitIntoSentences(cvText);
  const items: EvidenceItem[] = [];

  let charOffset = 0;
  for (const sentence of sentences) {
    const index = cvText.indexOf(sentence, charOffset);
    charOffset = index >= 0 ? index : charOffset;
    const section = detectSection(sentence, sections, charOffset);

    for (const { skill } of findSkillMentions(sentence)) {
      const existing = items.find((item) => item.skill === skill);
      const confidence = classifyConfidence(sentence, section);

      if (!existing || isStrongerEvidence(sentence, confidence, existing)) {
        const item: EvidenceItem = {
          id: existing?.id ?? `ev_${items.length}`,
          skill,
          claim: `Has experience with ${skill}`,
          evidenceText: sentence,
          sourceTitle: section,
          confidence,
        };

        if (existing) {
          const existingIndex = items.findIndex((candidate) => candidate.skill === skill);
          items[existingIndex] = item;
        } else {
          items.push(item);
        }
      }
    }
  }

  return items;
}

function isStrongerEvidence(
  sentence: string,
  confidence: EvidenceItem["confidence"],
  existing: EvidenceItem,
): boolean {
  const rank = { low: 0, medium: 1, high: 2 } as const;
  if (rank[confidence] !== rank[existing.confidence]) {
    return rank[confidence] > rank[existing.confidence];
  }
  return sentence.length > existing.evidenceText.length;
}

function classifyConfidence(
  sentence: string,
  section: string,
): EvidenceItem["confidence"] {
  const lower = sentence.toLowerCase();
  const hasNumber = /\d/.test(sentence);
  const strongSections = [
    "experience",
    "work experience",
    "employment",
    "employment history",
    "projects",
    "selected project",
  ];
  const actionVerbs = [
    "built",
    "developed",
    "led",
    "designed",
    "implemented",
    "deployed",
    "created",
    "shipped",
    "trained",
    "analyzed",
    "analysed",
    "presented",
    "validated",
    "automated",
    "investigated",
    "produced",
    "maintained",
    "cleaned",
    "resolved",
  ];
  const hasActionVerb = actionVerbs.some((verb) => lower.includes(verb));

  if (strongSections.includes(section) && hasActionVerb) return "high";
  if (strongSections.includes(section) || hasNumber) return "medium";
  return "low";
}
