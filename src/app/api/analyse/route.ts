import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analyze";
import { exportAsMarkdown } from "@/lib/export/markdown";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cvText, jdText } = body as { cvText?: string; jdText?: string };

  if (!cvText || typeof cvText !== "string") {
    return NextResponse.json({ error: "cvText is required" }, { status: 400 });
  }
  if (!jdText || typeof jdText !== "string") {
    return NextResponse.json({ error: "jdText is required" }, { status: 400 });
  }
  if (cvText.length > 50_000 || jdText.length > 50_000) {
    return NextResponse.json({ error: "Input too large (max 50,000 chars each)" }, { status: 413 });
  }

  const result = await runAnalysis(cvText, jdText);
  const markdown = exportAsMarkdown(result);

  return NextResponse.json({ ...result, markdown });
}
