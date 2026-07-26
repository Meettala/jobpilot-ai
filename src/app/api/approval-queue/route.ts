import { NextRequest, NextResponse } from "next/server";
import {
  addApprovalQueueItem,
  getJob,
  listApprovalQueue,
  resolveApprovalQueueItem,
} from "@/lib/tracker/store";
import {
  hasOnlyKeys,
  isOneOf,
  readBoundedString,
  readJsonObject,
} from "@/lib/http/request-validation";

const ACTION_TYPES = ["draft_follow_up", "mark_stale"] as const;
const DECISIONS = ["approved", "rejected"] as const;

export async function GET() {
  return NextResponse.json({ items: listApprovalQueue() });
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body || !hasOnlyKeys(body, ["jobId", "actionType", "proposedContent"])) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const jobId = readBoundedString(body.jobId, { max: 100 });
  const proposedContent = readBoundedString(body.proposedContent, { max: 2_000 });
  if (!jobId || !proposedContent || !isOneOf(body.actionType, ACTION_TYPES)) {
    return NextResponse.json({ error: "Invalid approval-queue request" }, { status: 400 });
  }
  if (!getJob(jobId)) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const item = addApprovalQueueItem(jobId, body.actionType, proposedContent);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body || !hasOnlyKeys(body, ["id", "decision"])) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const id = readBoundedString(body.id, { max: 100 });
  if (!id || !isOneOf(body.decision, DECISIONS)) {
    return NextResponse.json({ error: "Invalid approval decision" }, { status: 400 });
  }

  const result = resolveApprovalQueueItem(id, body.decision);
  if (result.kind === "not_found") {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (result.kind === "already_resolved") {
    return NextResponse.json({ error: "Item already resolved", item: result.item }, { status: 409 });
  }
  return NextResponse.json({ item: result.item });
}
