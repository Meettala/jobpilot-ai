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

describe("cross-role match calibration", () => {
  it("does not report a data analyst CV as a perfect event crew match", async () => {
    const result = await runAnalysis(DATA_ANALYST_CV, EVENT_CREW_JOB);

    expect(result.job.jobTitle).toBe("Event Crew Member");
    expect(result.match.matchScore).toBeGreaterThan(0);
    expect(result.match.matchScore).toBeLessThan(40);
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
});
