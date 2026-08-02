import { describe, expect, it } from "vitest";
import { runAnalysis } from "@/lib/analyze";
import type { EvidenceItem } from "@/lib/evidence/extract-cv";
import type { JobRequirements } from "@/lib/evidence/extract-jd";
import { matchEvidenceToJob } from "@/lib/scoring/match";

const DATA_ANALYST_CV = `
PRIYA SHAH FICTIONAL TEST CV
JUNIOR DATA ANALYST

PROFESSIONAL PROFILE
Analytical and detail-focused MSc graduate with hands-on experience cleaning datasets, building dashboards and translating findings into practical recommendations.

CORE SKILLS
SQL • Python • Pandas • Power BI • Excel • Data cleaning • Stakeholder communication

EMPLOYMENT HISTORY
Data Analyst Intern | Northbridge Retail Ltd
• Cleaned and joined sales, product and customer datasets using SQL and Python.
• Built a Power BI dashboard tracking weekly revenue and regional performance.
• Presented concise findings and data limitations to marketing and operations stakeholders.
`;

const EVENT_CREW_JOB = `
Full job description
Event crew jobs in Glasgow.
We have part-time and full-time positions available for our event crew team.

Loading and unloading trucks
Rigging and de-rigging lights, sound and AV equipment
Lighting, power and AV installation
Building and dismantling set, scenery and stages.

Candidates must be reliable, punctual, proactive, flexible with unsociable hours, good communicators, team players and fast learners.

The following increase earning potential:
Forklift licences, scissor lift or cherry picker, PASMA, Working at Height, CSCS card and SPA Card.
`;

const PARTIAL_EVENT_CV = `
Warehouse Operative
Experience
Loaded and unloaded delivery vehicles safely as part of a warehouse team.
Worked flexible night shifts, followed manual-handling procedures and communicated with supervisors.
`;

function makeEvidence(skill: string, confidence: EvidenceItem["confidence"], id: string): EvidenceItem {
  return {
    id,
    skill,
    claim: `Has experience with ${skill}`,
    evidenceText: `Demonstrated ${skill} in a relevant work example.`,
    sourceTitle: "experience",
    confidence,
  };
}

function makeJob(title: string, requiredSkills: string[]): JobRequirements {
  return { jobTitle: title, company: "Test Employer", location: "UK", requiredSkills, preferredSkills: [] };
}

describe("cross-role match calibration", () => {
  it("reports a data analyst CV as an occupational mismatch for event crew work", async () => {
    const result = await runAnalysis(DATA_ANALYST_CV, EVENT_CREW_JOB);

    expect(result.job.jobTitle).toBe("Event Crew Member");
    expect(result.match.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.match.matchScore).toBeLessThan(25);
    expect(result.match.matchLevel).toBe("occupational_mismatch");
    expect(result.match.matchLabel).toBe("Likely occupational mismatch");
    expect(result.match.matchSummary).toMatch(/not provide enough relevant evidence/i);
    expect(result.match.reasons.join(" ")).toMatch(/core required evidence missing/i);
    expect(result.match.missingSkills).toContain("Loading and Unloading");
    expect(result.match.missingSkills).toContain("Rigging");
    expect(result.match.missingSkills).toContain("AV Equipment");
    expect(result.match.missingSkills).toContain("Event Setup");

    expect(result.coverLetter.letter).toContain("apply for the Event Crew Member");
    expect(result.coverLetter.letter).not.toContain("apply for the Full job description");

    expect(result.interviewQuestions.behavioural.join(" ")).toMatch(/shift|team|practical/i);
    expect(result.interviewQuestions.toAskEmployer.join(" ")).toMatch(/safety|training|shift/i);
    expect(result.interviewQuestions.toAskEmployer.join(" ")).not.toMatch(/build vs|technical challenge/i);

    expect(result.linkedin.headline).toContain("Open to Event Crew Member Opportunities");
    expect(result.linkedin.headline).not.toContain("Full job description");
  });

  it("does not overstate limited transferable event evidence", async () => {
    const result = await runAnalysis(PARTIAL_EVENT_CV, EVENT_CREW_JOB);

    expect(["occupational_mismatch", "weak", "partial"]).toContain(result.match.matchLevel);
    expect(result.match.matchLevel).not.toBe("strong");
    expect(result.match.requiredCoverage).toBeGreaterThan(0);
    expect(result.match.missingSkills).toContain("Rigging");
    expect(result.match.missingSkills).toContain("AV Equipment");
    expect(result.match.matchSummary).toMatch(/limited|some important requirements|gaps|not provide enough relevant evidence/i);
  });
});

describe("generic evidence-based verdict rules", () => {
  it.each([
    {
      name: "software engineer",
      job: makeJob("Software Engineer", ["Python", "Git", "REST APIs", "Docker"]),
      evidence: [
        makeEvidence("Python", "high", "ev_1"),
        makeEvidence("Git", "high", "ev_2"),
        makeEvidence("REST APIs", "medium", "ev_3"),
        makeEvidence("Docker", "high", "ev_4"),
      ],
      expected: "strong",
    },
    {
      name: "data analyst with important gaps",
      job: makeJob("Data Analyst", ["SQL", "Pandas", "Data Visualization", "Statistics"]),
      evidence: [makeEvidence("SQL", "high", "ev_1"), makeEvidence("Pandas", "medium", "ev_2")],
      expected: "partial",
    },
    {
      name: "warehouse role with only a generic teamwork mention",
      job: makeJob("Warehouse Operative", ["Loading and Unloading", "Manual Handling", "Teamwork", "Flexible Hours"]),
      evidence: [makeEvidence("Teamwork", "low", "ev_1")],
      expected: "occupational_mismatch",
    },
    {
      name: "event technician with weak but relevant claims",
      job: makeJob("Event Technician", ["Rigging", "AV Equipment", "Event Setup", "Working at Height"]),
      evidence: [
        makeEvidence("Rigging", "low", "ev_1"),
        makeEvidence("AV Equipment", "medium", "ev_2"),
        makeEvidence("Event Setup", "low", "ev_3"),
      ],
      expected: "weak",
    },
  ])("classifies $name from evidence coverage rather than identity", ({ job, evidence, expected }) => {
    const result = matchEvidenceToJob(evidence, job);

    expect(result.matchLevel).toBe(expected);
    expect(result.matchLabel).toBeTruthy();
    expect(result.matchSummary).toBeTruthy();
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.requiredCoverage).toBeGreaterThanOrEqual(0);
    expect(result.requiredCoverage).toBeLessThanOrEqual(100);
  });

  it("does not treat one transferable skill as proof of genuine role fit", () => {
    const result = matchEvidenceToJob(
      [makeEvidence("Communication", "high", "ev_1")],
      makeJob("Retail Assistant", ["Communication", "Customer Service", "Cash Handling", "Stock Replenishment"]),
    );

    expect(result.matchScore).toBeLessThan(40);
    expect(result.matchLevel).toBe("occupational_mismatch");
    expect(result.missingSkills).toEqual(
      expect.arrayContaining(["Customer Service", "Cash Handling", "Stock Replenishment"]),
    );
  });
});
