/**
 * Extracts structured requirements from a job description using the same
 * taxonomy as CV evidence extraction.
 */

import { findSkillMentions } from "./taxonomy";

export type JobRequirements = {
  jobTitle: string;
  company: string;
  location: string;
  requiredSkills: string[];
  preferredSkills: string[];
};

const PREFERRED_MARKERS = [
  "preferred",
  "nice to have",
  "bonus",
  "a plus",
  "desirable",
  "increase your earning potential",
];

const BOILERPLATE_LINES = new Set([
  "full job description",
  "job description",
  "about the role",
  "about us",
]);

const ROLE_PATTERNS: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /\bevent crew(?: member| team)?\b/i, title: "Event Crew Member" },
  { pattern: /\bcrew member\b/i, title: "Crew Member" },
  { pattern: /\bwarehouse operative\b/i, title: "Warehouse Operative" },
  { pattern: /\bshop assistant\b/i, title: "Shop Assistant" },
  { pattern: /\bdata analyst\b/i, title: "Data Analyst" },
  { pattern: /\bsoftware engineer\b/i, title: "Software Engineer" },
  { pattern: /\bweb(?:site)? designer\b/i, title: "Website Designer" },
];

export function extractJobRequirements(
  jdText: string,
  hints?: { jobTitle?: string; company?: string; location?: string },
): JobRequirements {
  const sentences = jdText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const required = new Set<string>();
  const preferred = new Set<string>();

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const isPreferredContext = PREFERRED_MARKERS.some((marker) => lower.includes(marker));
    const mentions = findSkillMentions(sentence);

    for (const { skill } of mentions) {
      if (isPreferredContext) preferred.add(skill);
      else required.add(skill);
    }
  }

  for (const skill of required) preferred.delete(skill);

  return {
    jobTitle: hints?.jobTitle ?? guessTitle(jdText),
    company: hints?.company ?? "",
    location: hints?.location ?? "",
    requiredSkills: Array.from(required),
    preferredSkills: Array.from(preferred),
  };
}

function guessTitle(jdText: string): string {
  for (const { pattern, title } of ROLE_PATTERNS) {
    if (pattern.test(jdText)) return title;
  }

  const segments = jdText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => segment.trim().replace(/[.!?]+$/, ""))
    .filter((segment) => segment.length > 0)
    .filter((segment) => !BOILERPLATE_LINES.has(segment.toLowerCase()));

  const titleKeywords = [
    "engineer",
    "scientist",
    "developer",
    "analyst",
    "manager",
    "designer",
    "operative",
    "assistant",
    "technician",
    "crew",
  ];

  const candidate = segments.find(
    (segment) =>
      segment.length <= 80 &&
      titleKeywords.some((keyword) => segment.toLowerCase().includes(keyword)),
  );

  if (candidate) return candidate;
  return "Untitled role";
}
