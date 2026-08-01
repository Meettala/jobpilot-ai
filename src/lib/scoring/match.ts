import type { EvidenceItem } from "../evidence/extract-cv";
import type { JobRequirements } from "../evidence/extract-jd";

export type MatchResult = {
  matchScore: number;
  matchedSkills: { skill: string; confidence: EvidenceItem["confidence"] }[];
  missingSkills: string[];
  weakEvidence: { skill: string; reason: string }[];
};

const CONFIDENCE_WEIGHT: Record<EvidenceItem["confidence"], number> = {
  high: 1,
  medium: 0.7,
  low: 0.3,
};

export function matchEvidenceToJob(
  evidence: EvidenceItem[],
  job: JobRequirements,
): MatchResult {
  const evidenceBySkill = new Map(evidence.map((item) => [item.skill, item]));
  const allRequirements = [...job.requiredSkills, ...job.preferredSkills];

  const matchedSkills: MatchResult["matchedSkills"] = [];
  const missingSkills: string[] = [];
  const weakEvidence: MatchResult["weakEvidence"] = [];

  for (const skill of allRequirements) {
    const item = evidenceBySkill.get(skill);
    if (!item) {
      missingSkills.push(skill);
      continue;
    }

    matchedSkills.push({ skill, confidence: item.confidence });
    if (item.confidence === "low") {
      weakEvidence.push({
        skill,
        reason: `Only a passing mention found ("${truncate(item.evidenceText)}") — consider adding a concrete example.`,
      });
    }
  }

  const requiredScore = scoreRequirements(job.requiredSkills, evidenceBySkill);
  const preferredScore = scoreRequirements(job.preferredSkills, evidenceBySkill);
  const hasPreferred = job.preferredSkills.length > 0;

  const weightedScore = hasPreferred
    ? requiredScore * 0.85 + preferredScore * 0.15
    : requiredScore;

  const matchScore = Math.max(0, Math.min(100, Math.round(weightedScore * 100)));

  return { matchScore, matchedSkills, missingSkills, weakEvidence };
}

function scoreRequirements(
  requirements: string[],
  evidenceBySkill: Map<string, EvidenceItem>,
): number {
  if (requirements.length === 0) return 0;

  const earned = requirements.reduce((total, skill) => {
    const evidence = evidenceBySkill.get(skill);
    return total + (evidence ? CONFIDENCE_WEIGHT[evidence.confidence] : 0);
  }, 0);

  return earned / requirements.length;
}

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
