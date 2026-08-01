import { describe, expect, it } from "vitest";
import { runAnalysis } from "@/lib/analyze";

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

  it("distinguishes limited transferable evidence from a strong match", async () => {
    const result = await runAnalysis(PARTIAL_EVENT_CV, EVENT_CREW_JOB);

    expect(["weak", "partial"]).toContain(result.match.matchLevel);
    expect(result.match.matchLevel).not.toBe("strong");
    expect(result.match.requiredCoverage).toBeGreaterThan(0);
    expect(result.match.missingSkills).toContain("Rigging");
    expect(result.match.missingSkills).toContain("AV Equipment");
    expect(result.match.matchSummary).toMatch(/limited|some important requirements|gaps/i);
  });
});
