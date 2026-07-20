/**
 * The endpoint the n8n workflow (n8n/follow-up-workflow.json) calls
 * daily. It only ever returns suggestions - it has no ability to send
 * anything. Writing those suggestions into the approval queue happens
 * via a separate POST to /api/approval-queue, which itself only ever
 * creates a "pending" item.
 */
import { NextResponse } from "next/server";
import { listJobs } from "@/lib/tracker/store";
import { findJobsNeedingAction } from "@/lib/tracker/suggestions";

export async function GET() {
  const suggestions = findJobsNeedingAction(listJobs());
  return NextResponse.json({ suggestions });
}
