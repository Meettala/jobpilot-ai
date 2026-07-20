import type { EvidenceItem } from "../evidence/extract-cv";
import type { MatchResult } from "../scoring/match";

export type LinkedInSuggestions = {
  headline: string;
  aboutSectionPoints: string[];
  skillsToAdd: string[];
  featuredSectionOrder: string[];
};

export function generateLinkedInSuggestions(
  evidence: EvidenceItem[],
  match: MatchResult,
  jobTitle: string
): LinkedInSuggestions {
  const topSkills = match.matchedSkills
    .filter((m) => m.confidence === "high")
    .slice(0, 3)
    .map((m) => m.skill);

  const headline = topSkills.length > 0
    ? `${jobTitle || "AI/ML Engineer"} | ${topSkills.join(" · ")}`
    : jobTitle || "AI/ML Engineer";

  const aboutSectionPoints = evidence
    .filter((e) => e.confidence === "high")
    .slice(0, 5)
    .map((e) => e.evidenceText);

  return {
    headline,
    aboutSectionPoints,
    // Only ever suggests skills the evidence bank actually supports —
    // never suggests adding a missing/unproven skill to the profile.
    skillsToAdd: match.matchedSkills.map((m) => m.skill),
    featuredSectionOrder: evidence
      .filter((e) => e.sourceTitle.toLowerCase().includes("project"))
      .map((e) => e.skill),
  };
}
