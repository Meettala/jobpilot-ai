import type { EvidenceItem } from "../evidence/extract-cv";
import type { JobRequirements } from "../evidence/extract-jd";

export type MatchResult = {
  matchScore: number; // 0-100
  matchedSkills: { skill: string; confidence: EvidenceItem["confidence"] }[];
  missingSkills: string[];
  weakEvidence: { skill: string; reason: string }[];
};

export function matchEvidenceToJob(evidence: EvidenceItem[], job: JobRequirements): MatchResult {
  const evidenceBySkill = new Map(evidence.map((e) => [e.skill, e]));
  const allRequired = [...job.requiredSkills, ...job.preferredSkills];

  const matchedSkills: MatchResult["matchedSkills"] = [];
  const missingSkills: string[] = [];
  const weakEvidence: MatchResult["weakEvidence"] = [];

  for (const skill of allRequired) {
    const ev = evidenceBySkill.get(skill);
    if (!ev) {
      missingSkills.push(skill);
    } else if (ev.confidence === "low") {
      weakEvidence.push({ skill, reason: `Only a passing mention found ("${truncate(ev.evidenceText)}") — consider adding a concrete example.` });
      matchedSkills.push({ skill, confidence: ev.confidence });
    } else {
      matchedSkills.push({ skill, confidence: ev.confidence });
    }
  }

  const requiredCount = job.requiredSkills.length || 1;
  const requiredMatched = job.requiredSkills.filter((s) => evidenceBySkill.has(s)).length;
  const matchScore = Math.round((requiredMatched / requiredCount) * 100);

  return { matchScore, matchedSkills, missingSkills, weakEvidence };
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}
