/**
 * In-memory demo store for the jobs and approval queue tables described in
 * supabase/schema.sql. Module state resets on server restart and is not a
 * production persistence layer.
 */

export type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected" | "closed";

export type Job = {
  id: string;
  jobTitle: string;
  company: string;
  status: JobStatus;
  followUpDate: string;
  lastStatusChange: string;
  jobDescription: string;
};

export type ActionType = "draft_follow_up" | "mark_stale";
export type ApprovalDecision = "approved" | "rejected";

export type ApprovalQueueItem = {
  id: string;
  jobId: string;
  actionType: ActionType;
  proposedContent: string;
  status: "pending" | ApprovalDecision;
  createdAt: string;
};

export type ApprovalResolution =
  | { kind: "resolved"; item: ApprovalQueueItem }
  | { kind: "already_resolved"; item: ApprovalQueueItem }
  | { kind: "not_found" };

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
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

export function listJobs(): Job[] {
  return jobs;
}

export function getJob(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  const job = jobs.find((candidate) => candidate.id === id);
  if (job) {
    job.status = status;
    job.lastStatusChange = new Date().toISOString().slice(0, 10);
  }
  return job;
}

export function listApprovalQueue(): ApprovalQueueItem[] {
  return approvalQueue;
}

export function addApprovalQueueItem(
  jobId: string,
  actionType: ActionType,
  proposedContent: string,
): ApprovalQueueItem {
  const existing = approvalQueue.find(
    (item) => item.jobId === jobId && item.actionType === actionType && item.status === "pending",
  );
  if (existing) return existing;

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
 * The only approval-driven state-change boundary. Pending items never act,
 * rejected items never act, and already-resolved items cannot be replayed.
 */
export function resolveApprovalQueueItem(
  id: string,
  decision: ApprovalDecision,
): ApprovalResolution {
  const item = approvalQueue.find((candidate) => candidate.id === id);
  if (!item) return { kind: "not_found" };
  if (item.status !== "pending") return { kind: "already_resolved", item };

  item.status = decision;
  if (decision === "approved" && item.actionType === "mark_stale") {
    updateJobStatus(item.jobId, "closed");
  }
  return { kind: "resolved", item };
}

export function __resetForTests(freshJobs: Job[]) {
  jobs = freshJobs;
  approvalQueue = [];
  idCounter = 1;
}
