import type { EvidenceItem } from "../evidence/extract-cv";
import type { JobRequirements } from "../evidence/extract-jd";

export type MatchLevel = "strong" | "partial" | "weak" | "occupational_mismatch";

export type MatchResult = {
  matchScore: number;
  matchLevel: MatchLevel;
  matchLabel: string;
  matchSummary: string;
  requiredCoverage: number;
  matchedSkills: { skill: string; confidence: EvidenceItem["confidence"] }[];
  missingSkills: string[];
  weakEvidence: { skill: string; reason: string }[];
  reasons: string[];
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
        reason: `Only a passing mention found ("${truncate(item.evidenceText)}") — no concrete example confirms practical experience.`,
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
  const requiredMatched = job.requiredSkills.filter((skill) => evidenceBySkill.has(skill)).length;
  const requiredCoverage = job.requiredSkills.length === 0
    ? 0
    : Math.round((requiredMatched / job.requiredSkills.length) * 100);
  const supportedRequired = job.requiredSkills.filter((skill) => {
    const item = evidenceBySkill.get(skill);
    return item?.confidence === "high" || item?.confidence === "medium";
  });
  const strongRequiredCoverage = job.requiredSkills.length === 0
    ? 0
    : supportedRequired.length / job.requiredSkills.length;

  const matchLevel = classifyMatch(matchScore, requiredCoverage, strongRequiredCoverage);
  const matchLabel = labelFor(matchLevel);
  const reasons = buildReasons(job, matchedSkills, missingSkills, weakEvidence, requiredCoverage);
  const matchSummary = summaryFor(matchLevel, job.jobTitle, requiredCoverage);

  return {
    matchScore,
    matchLevel,
    matchLabel,
    matchSummary,
    requiredCoverage,
    matchedSkills,
    missingSkills,
    weakEvidence,
    reasons,
  };
}

function classifyMatch(
  score: number,
  requiredCoverage: number,
  strongRequiredCoverage: number,
): MatchLevel {
  if (score >= 75 && requiredCoverage >= 75 && strongRequiredCoverage >= 0.6) return "strong";
  if (score >= 50 && requiredCoverage >= 50 && strongRequiredCoverage >= 0.35) return "partial";
  if (score >= 25 && requiredCoverage >= 25) return "weak";
  return "occupational_mismatch";
}

function labelFor(level: MatchLevel): string {
  switch (level) {
    case "strong":
      return "Strong evidence-based match";
    case "partial":
      return "Partial match";
    case "weak":
      return "Weak match";
    case "occupational_mismatch":
      return "Likely occupational mismatch";
  }
}

function summaryFor(level: MatchLevel, jobTitle: string, requiredCoverage: number): string {
  const role = jobTitle || "this role";
  switch (level) {
    case "strong":
      return `The CV provides substantial, concrete evidence for most core requirements of ${role}.`;
    case "partial":
      return `The CV supports some important requirements for ${role}, but material gaps remain.`;
    case "weak":
      return `The CV has limited transferable evidence for ${role}; only ${requiredCoverage}% of required areas are mentioned.`;
    case "occupational_mismatch":
      return `The CV does not provide enough relevant evidence for the core duties of ${role}. Generic transferable skills do not establish genuine role fit.`;
  }
}

function buildReasons(
  job: JobRequirements,
  matched: MatchResult["matchedSkills"],
  missing: string[],
  weak: MatchResult["weakEvidence"],
  requiredCoverage: number,
): string[] {
  const reasons: string[] = [];
  reasons.push(`${requiredCoverage}% of required areas have any CV evidence.`);

  const concrete = matched.filter((item) => item.confidence !== "low").map((item) => item.skill);
  if (concrete.length > 0) reasons.push(`Concrete or contextual evidence: ${concrete.join(", ")}.`);
  if (weak.length > 0) reasons.push(`Passing mentions only: ${weak.map((item) => item.skill).join(", ")}.`);

  const missingRequired = job.requiredSkills.filter((skill) => missing.includes(skill));
  if (missingRequired.length > 0) {
    reasons.push(`Core required evidence missing: ${missingRequired.slice(0, 8).join(", ")}${missingRequired.length > 8 ? ", and more" : ""}.`);
  }

  return reasons;
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
