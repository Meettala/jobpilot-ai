/**
 * Extracts structured requirements from a job description: title,
 * company, location if detectable, and required/preferred skills.
 * Same taxonomy as CV extraction so matching is apples-to-apples.
 */

import { findSkillMentions } from "./taxonomy";

export type JobRequirements = {
  jobTitle: string;
  company: string;
  location: string;
  requiredSkills: string[];
  preferredSkills: string[];
};

const PREFERRED_MARKERS = ["preferred", "nice to have", "bonus", "a plus", "desirable"];

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
  const segments = jdText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => segment.trim().replace(/[.!?]+$/, ""))
    .filter(Boolean);
  const titleKeywords = ["engineer", "scientist", "developer", "analyst", "manager", "designer"];
  const candidate = segments.find(
    (segment) =>
      segment.length <= 80 &&
      titleKeywords.some((keyword) => segment.toLowerCase().includes(keyword)),
  );
  if (candidate) return candidate;
  const firstShortSegment = segments.find((segment) => segment.length <= 80);
  return firstShortSegment ?? "Untitled role";
}
