import { describe, it, expect } from "vitest";
import { buildEvidenceBank } from "@/lib/evidence/extract-cv";
import { extractJobRequirements } from "@/lib/evidence/extract-jd";

const SAMPLE_CV = `
Summary
AI/ML engineer with hands-on project experience.

Experience
Built a machine learning pipeline in Python using pandas and scikit-learn to predict housing prices.
Developed a RAG system using retrieval augmented generation and the OpenAI API to answer questions from documents.
Deployed services with Docker and used Git for version control throughout.

Projects
Created a SQL-based analytics dashboard using Tableau for data visualization.

Education
BSc Computer Science.
`;

const SAMPLE_JD = `
Junior Machine Learning Engineer
We need someone with strong Python and SQL skills.
Experience with machine learning and pandas is required.
Familiarity with AWS is preferred but not required.
Knowledge of Kubernetes would be a nice to have.
`;

describe("buildEvidenceBank", () => {
  it("extracts skills with supporting sentences", () => {
    const bank = buildEvidenceBank(SAMPLE_CV);
    const skills = bank.map((e) => e.skill);
    expect(skills).toContain("Python");
    expect(skills).toContain("RAG");
    expect(skills).toContain("Docker");
  });

  it("assigns high confidence to action-verb sentences in experience section", () => {
    const bank = buildEvidenceBank(SAMPLE_CV);
    const python = bank.find((e) => e.skill === "Python");
    expect(python?.confidence).toBe("high");
  });

  it("every evidence item's text is a real substring of the CV", () => {
    const bank = buildEvidenceBank(SAMPLE_CV);
    for (const item of bank) {
      expect(SAMPLE_CV).toContain(item.evidenceText);
    }
  });
});

describe("extractJobRequirements", () => {
  it("separates required from preferred skills", () => {
    const job = extractJobRequirements(SAMPLE_JD);
    expect(job.requiredSkills).toContain("Python");
    expect(job.requiredSkills).toContain("SQL");
    expect(job.preferredSkills).toContain("Cloud (AWS)");
    expect(job.preferredSkills).toContain("Kubernetes");
    expect(job.requiredSkills).not.toContain("Cloud (AWS)");
  });
});
