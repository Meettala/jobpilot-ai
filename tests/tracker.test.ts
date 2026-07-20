import { describe, it, expect, beforeEach } from "vitest";
import { findJobsNeedingAction } from "@/lib/tracker/suggestions";
import {
  listJobs,
  listApprovalQueue,
  addApprovalQueueItem,
  resolveApprovalQueueItem,
  updateJobStatus,
  __resetForTests,
  type Job,
} from "@/lib/tracker/store";

const TODAY = new Date("2026-07-20");

function job(overrides: Partial<Job>): Job {
  return {
    id: "job_test",
    jobTitle: "Test Role",
    company: "Test Co",
    status: "applied",
    followUpDate: "2026-08-01",
    lastStatusChange: "2026-07-15",
    jobDescription: "Test job description.",
    ...overrides,
  };
}

describe("findJobsNeedingAction", () => {
  it("flags a job whose follow-up date has passed", () => {
    const jobs = [job({ id: "j1", followUpDate: "2026-07-10" })];
    const suggestions = findJobsNeedingAction(jobs, TODAY);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].actionType).toBe("draft_follow_up");
  });

  it("does not flag a job with a future follow-up date and recent activity", () => {
    const jobs = [job({ id: "j2", followUpDate: "2026-08-01", lastStatusChange: "2026-07-18" })];
    expect(findJobsNeedingAction(jobs, TODAY)).toHaveLength(0);
  });

  it("flags a stale job even with a future follow-up date", () => {
    const jobs = [job({ id: "j3", followUpDate: "2026-08-01", lastStatusChange: "2026-06-01" })];
    const suggestions = findJobsNeedingAction(jobs, TODAY);
    expect(suggestions[0].actionType).toBe("mark_stale");
  });

  it("never flags closed or rejected jobs", () => {
    const jobs = [
      job({ id: "j4", status: "closed", followUpDate: "2026-01-01" }),
      job({ id: "j5", status: "rejected", followUpDate: "2026-01-01" }),
    ];
    expect(findJobsNeedingAction(jobs, TODAY)).toHaveLength(0);
  });
});

describe("approval queue - propose, never act, until explicit approval", () => {
  beforeEach(() => {
    __resetForTests([job({ id: "j1", status: "applied" })]);
  });

  it("adding a suggestion to the queue does not change job status", () => {
    const before = listJobs().find((j) => j.id === "j1");
    addApprovalQueueItem("j1", "mark_stale", "Suggest closing this application.");
    const after = listJobs().find((j) => j.id === "j1");
    expect(after?.status).toBe(before?.status);
    expect(listApprovalQueue()).toHaveLength(1);
    expect(listApprovalQueue()[0].status).toBe("pending");
  });

  it("rejecting an item never changes job state", () => {
    const item = addApprovalQueueItem("j1", "mark_stale", "Suggest closing.");
    resolveApprovalQueueItem(item.id, "rejected");
    const job1 = listJobs().find((j) => j.id === "j1");
    expect(job1?.status).toBe("applied");
  });

  it("only an explicit approve changes job state", () => {
    const item = addApprovalQueueItem("j1", "mark_stale", "Suggest closing.");
    expect(listJobs().find((j) => j.id === "j1")?.status).toBe("applied");
    resolveApprovalQueueItem(item.id, "approved");
    expect(listJobs().find((j) => j.id === "j1")?.status).toBe("closed");
  });

  it("a draft_follow_up approval never sends anything - it stays a draft", () => {
    const item = addApprovalQueueItem("j1", "draft_follow_up", "Hi, following up...");
    resolveApprovalQueueItem(item.id, "approved");
    // Job status is untouched by a follow-up draft approval - there is
    // no send action anywhere in this codebase to trigger.
    expect(listJobs().find((j) => j.id === "j1")?.status).toBe("applied");
    expect(listApprovalQueue()[0].status).toBe("approved");
  });

  it("resolving an already-resolved item is a no-op", () => {
    const item = addApprovalQueueItem("j1", "mark_stale", "x");
    resolveApprovalQueueItem(item.id, "approved");
    updateJobStatus("j1", "interviewing"); // simulate manual change after approval
    resolveApprovalQueueItem(item.id, "approved"); // re-approving shouldn't re-fire
    expect(listJobs().find((j) => j.id === "j1")?.status).toBe("interviewing");
  });
});
