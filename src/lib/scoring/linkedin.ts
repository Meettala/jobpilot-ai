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
  jobTitle: string,
): LinkedInSuggestions {
  const supportedSkills = match.matchedSkills
    .filter((item) => item.confidence !== "low")
    .slice(0, 3)
    .map((item) => item.skill);

  const safeTitle = normalizeTitle(jobTitle);
  const titlePrefix = match.matchScore < 40
    ? `Open to ${safeTitle} Opportunities`
    : safeTitle;

  const headline = supportedSkills.length > 0
    ? `${titlePrefix} | ${supportedSkills.join(" · ")}`
    : titlePrefix;

  const aboutSectionPoints = evidence
    .filter((item) => item.confidence === "high")
    .slice(0, 5)
    .map((item) => item.evidenceText);

  return {
    headline,
    aboutSectionPoints,
    skillsToAdd: match.matchedSkills
      .filter((item) => item.confidence !== "low")
      .map((item) => item.skill),
    featuredSectionOrder: evidence
      .filter((item) => item.sourceTitle.toLowerCase().includes("project"))
      .map((item) => item.skill),
  };
}

function normalizeTitle(jobTitle: string): string {
  const trimmed = jobTitle.trim();
  if (!trimmed || /^(full )?job description$/i.test(trimmed) || /^untitled role$/i.test(trimmed)) {
    return "Relevant Roles";
  }
  return trimmed;
}
