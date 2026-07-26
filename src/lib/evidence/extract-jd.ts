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

export function extractJobRequirements(jdText: string, hints?: { jobTitle?: string; company?: string; location?: string }): JobRequirements {
  const sentences = jdText.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

  const required = new Set<string>();
  const preferred = new Set<string>();

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase();
    const isPreferredContext = PREFERRED_MARKERS.some((m) => sLower.includes(m));
    const mentions = findSkillMentions(sentence);
    for (const { skill } of mentions) {
      if (isPreferredContext) preferred.add(skill);
      else required.add(skill);
    }
  }

  // A skill mentioned in both contexts counts as required (the stronger claim).
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
  const lines = jdText.split("\n").map((l) => l.trim()).filter(Boolean);
  // Prefer a short line containing a common role-title keyword.
  const titleKeywords = ["engineer", "scientist", "developer", "analyst", "manager", "designer"];
  const candidate = lines.find(
    (l) => l.length < 60 && titleKeywords.some((k) => l.toLowerCase().includes(k))
  );
  if (candidate) return candidate;
  const firstShortLine = lines.find((l) => l.length > 0 && l.length < 60);
  return firstShortLine ?? "Untitled role";
}
