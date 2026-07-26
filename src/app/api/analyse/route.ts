import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analyze";
import { exportAsMarkdown } from "@/lib/export/markdown";
import { hasOnlyKeys, readBoundedString, readJsonObject } from "@/lib/http/request-validation";

const MAX_INPUT_CHARS = 50_000;

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body || !hasOnlyKeys(body, ["cvText", "jdText"])) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const cvText = readBoundedString(body.cvText, { max: MAX_INPUT_CHARS });
  const jdText = readBoundedString(body.jdText, { max: MAX_INPUT_CHARS });

  if (!cvText || !jdText) {
    return NextResponse.json(
      { error: "cvText and jdText must be non-empty strings up to 50,000 characters" },
      { status: 400 },
    );
  }

  try {
    const result = await runAnalysis(cvText, jdText);
    const markdown = exportAsMarkdown(result);
    return NextResponse.json({ ...result, markdown });
  } catch {
    return NextResponse.json({ error: "Analysis could not be completed" }, { status: 500 });
  }
}
