/**
 * In-memory store standing in for the `jobs` and `approval_queue` tables
 * from supabase/schema.sql (not yet applied — see PROJECT_STATUS.md).
 * Swapping this for real Supabase calls later is a drop-in replacement:
 * every function here has the same shape a Supabase-backed version would.
 *
 * NOTE: module-level state resets on server restart. Fine for a demo;
 * not a substitute for the real database once it's wired up.
 */

export type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected" | "closed";

export type Job = {
  id: string;
  jobTitle: string;
  company: string;
  status: JobStatus;
  followUpDate: string; // ISO date
  lastStatusChange: string; // ISO date
  jobDescription: string;
};

export type ActionType = "draft_follow_up" | "mark_stale";

export type ApprovalQueueItem = {
  id: string;
  jobId: string;
  actionType: ActionType;
  proposedContent: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

let jobs: Job[] = [
  {
    id: "job_1",
    jobTitle: "Junior ML Engineer",
    company: "Northwind Analytics",
    status: "applied",
    followUpDate: daysAgo(3),
    lastStatusChange: daysAgo(10),
    jobDescription: "Junior ML Engineer role focused on Python, pandas, and model deployment.",
  },
  {
    id: "job_2",
    jobTitle: "AI Engineer",
    company: "Bluepeak AI",
    status: "applied",
    followUpDate: daysFromNow(4),
    lastStatusChange: daysAgo(2),
    jobDescription: "AI Engineer role building RAG pipelines with LLM APIs and vector databases.",
  },
  {
    id: "job_3",
    jobTitle: "Data Scientist",
    company: "Cascade Intelligence",
    status: "interviewing",
    followUpDate: daysAgo(1),
    lastStatusChange: daysAgo(15),
    jobDescription: "Data Scientist role requiring SQL, statistics, and A/B testing experience.",
  },
];

let approvalQueue: ApprovalQueueItem[] = [];
let idCounter = 1;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function listJobs(): Job[] {
  return jobs;
}

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  const job = jobs.find((j) => j.id === id);
  if (job) {
    job.status = status;
    job.lastStatusChange = new Date().toISOString().slice(0, 10);
  }
  return job;
}

export function listApprovalQueue(): ApprovalQueueItem[] {
  return approvalQueue;
}

export function addApprovalQueueItem(jobId: string, actionType: ActionType, proposedContent: string): ApprovalQueueItem {
  const item: ApprovalQueueItem = {
    id: `aq_${idCounter++}`,
    jobId,
    actionType,
    proposedContent,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  approvalQueue.push(item);
  return item;
}

/**
 * The only place any job state actually changes as a result of a
 * suggested action — and it only runs when a human calls this with
 * "approved". There is no code path anywhere in this module that acts
 * on a "pending" item automatically.
 */
export function resolveApprovalQueueItem(id: string, decision: "approved" | "rejected"): ApprovalQueueItem | undefined {
  const item = approvalQueue.find((i) => i.id === id);
  if (!item || item.status !== "pending") return item;

  item.status = decision;
  if (decision === "approved" && item.actionType === "mark_stale") {
    updateJobStatus(item.jobId, "closed");
  }
  // "draft_follow_up" approval doesn't change job state itself — it's a
  // draft message ready for the user to actually send themselves,
  // consistent with "never auto-message recruiters".
  return item;
}

// Test-only reset helper — not exported from the public API surface used
// by routes, only imported directly by tests.
export function __resetForTests(freshJobs: Job[]) {
  jobs = freshJobs;
  approvalQueue = [];
  idCounter = 1;
}
