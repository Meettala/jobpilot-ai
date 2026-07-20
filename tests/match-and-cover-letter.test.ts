import { describe, it, expect } from "vitest";
import { buildEvidenceBank } from "@/lib/evidence/extract-cv";
import { extractJobRequirements } from "@/lib/evidence/extract-jd";
import { matchEvidenceToJob } from "@/lib/scoring/match";
import { draftCoverLetterTemplate, llmAvailable } from "@/lib/ai/cover-letter";

const CV_WITH_ONLY_PYTHON = `
Experience
Built data pipelines in Python for three years, working with pandas daily.
`;

const JD_WANTING_PYTHON_AND_KUBERNETES = `
We are hiring a Python engineer. Kubernetes experience is required for this role.
`;

describe("matchEvidenceToJob", () => {
  it("flags a required skill as missing when no evidence supports it", () => {
    const evidence = buildEvidenceBank(CV_WITH_ONLY_PYTHON);
    const job = extractJobRequirements(JD_WANTING_PYTHON_AND_KUBERNETES);
    const match = matchEvidenceToJob(evidence, job);
    expect(match.missingSkills).toContain("Kubernetes");
    expect(match.matchedSkills.map((m) => m.skill)).toContain("Python");
  });
});

describe("draftCoverLetterTemplate — the core honesty guarantee", () => {
  it("never mentions a skill with no evidence, even when the JD demands it", () => {
    const evidence = buildEvidenceBank(CV_WITH_ONLY_PYTHON);
    const job = extractJobRequirements(JD_WANTING_PYTHON_AND_KUBERNETES);
    const match = matchEvidenceToJob(evidence, job);
    const result = draftCoverLetterTemplate(evidence, job, match);

    expect(result.letter.toLowerCase()).not.toContain("kubernetes");
    expect(result.blockedClaims).toContain("Kubernetes");
  });

  it("every sentence used in the letter body is a real evidence item's text", () => {
    const evidence = buildEvidenceBank(CV_WITH_ONLY_PYTHON);
    const job = extractJobRequirements(JD_WANTING_PYTHON_AND_KUBERNETES);
    const match = matchEvidenceToJob(evidence, job);
    const result = draftCoverLetterTemplate(evidence, job, match);

    const evidenceTexts = evidence.map((e) => e.evidenceText.toLowerCase());
    const bodyLines = result.letter.split("\n").filter((l) => l.startsWith("-"));
    for (const line of bodyLines) {
      const stripped = line.replace(/^-\s*/, "").replace(/\.$/, "").toLowerCase();
      const matchesSomeEvidence = evidenceTexts.some((et) => et.includes(stripped) || stripped.includes(et.replace(/\.$/, "")));
      expect(matchesSomeEvidence).toBe(true);
    }
  });

  it("runs in template mode with no API key configured", () => {
    expect(llmAvailable()).toBe(false);
  });
});
