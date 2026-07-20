import { NextRequest, NextResponse } from "next/server";
import { listApprovalQueue, addApprovalQueueItem, resolveApprovalQueueItem } from "@/lib/tracker/store";

export async function GET() {
  return NextResponse.json({ items: listApprovalQueue() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jobId, actionType, proposedContent } = body as {
    jobId?: string; actionType?: "draft_follow_up" | "mark_stale"; proposedContent?: string;
  };
  if (!jobId || !actionType || !proposedContent) {
    return NextResponse.json({ error: "jobId, actionType, and proposedContent are required" }, { status: 400 });
  }
  const item = addApprovalQueueItem(jobId, actionType, proposedContent);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, decision } = body as { id?: string; decision?: "approved" | "rejected" };
  if (!id || !decision) {
    return NextResponse.json({ error: "id and decision are required" }, { status: 400 });
  }
  const item = resolveApprovalQueueItem(id, decision);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ item });
}
