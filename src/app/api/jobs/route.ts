import { NextResponse } from "next/server";
import { listJobs } from "@/lib/tracker/store";

export async function GET() {
  return NextResponse.json({ jobs: listJobs() });
}
