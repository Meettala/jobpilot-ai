/**
 * Decides which jobs need a suggested action. This is pure logic with no
 * side effects — it only returns proposals. Turning a proposal into an
 * approval-queue item (still pending, still not an action) happens in
 * the API route; turning an approved item into an actual state change
 * happens only in store.ts's resolveApprovalQueueItem, and only on
 * explicit human approval. Three separate layers, each one a chance to
 * NOT act, by design.
 *
 * This exact logic is what the n8n workflow (see n8n/follow-up-workflow.json)
 * calls via the /api/jobs/needs-follow-up route, so the automated and
 * in-app paths make identical decisions — see docs/product/mvp-scope.md.
 */

import type { Job } from "./store";

export type Suggestion = {
  jobId: string;
  actionType: "draft_follow_up" | "mark_stale";
  reason: string;
  proposedContent: string;
};

const STALE_DAYS_THRESHOLD = 21;

export function findJobsNeedingAction(jobs: Job[], today: Date = new Date()): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const job of jobs) {
    if (job.status === "closed" || job.status === "rejected") continue;

    const followUp = new Date(job.followUpDate);
    const daysSinceStatusChange = daysBetween(new Date(job.lastStatusChange), today);

    if (followUp <= today) {
      suggestions.push({
        jobId: job.id,
        actionType: "draft_follow_up",
        reason: `Follow-up date (${job.followUpDate}) has passed`,
        proposedContent: draftFollowUpMessage(job),
      });
    } else if (daysSinceStatusChange >= STALE_DAYS_THRESHOLD) {
      suggestions.push({
        jobId: job.id,
        actionType: "mark_stale",
        reason: `No status change in ${daysSinceStatusChange} days`,
        proposedContent: `Suggest marking "${job.jobTitle} at ${job.company}" as closed — no movement in ${daysSinceStatusChange} days.`,
      });
    }
  }

  return suggestions;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function draftFollowUpMessage(job: Job): string {
  return `Hi, I wanted to follow up on my application for the ${job.jobTitle} role at ${job.company}. I remain very interested and would welcome any update on next steps. Thank you for your time.`;
}
