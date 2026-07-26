import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as analyse } from "@/app/api/analyse/route";
import {
  PATCH as resolveApproval,
  POST as createApproval,
} from "@/app/api/approval-queue/route";
import { __resetForTests, listApprovalQueue, type Job } from "@/lib/tracker/store";

const TEST_JOB: Job = {
  id: "job_test",
  jobTitle: "Test Engineer",
  company: "Test Co",
  status: "applied",
  followUpDate: "2026-08-01",
  lastStatusChange: "2026-07-20",
  jobDescription: "A test role requiring Python.",
};

function jsonRequest(path: string, method: "POST" | "PATCH", body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  __resetForTests([TEST_JOB]);
});

describe("POST /api/analyse", () => {
  it("rejects malformed JSON and unexpected fields", async () => {
    const malformed = new NextRequest("http://localhost/api/analyse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });
    expect((await analyse(malformed)).status).toBe(400);

    const extraField = jsonRequest("/api/analyse", "POST", {
      cvText: "Built Python systems.",
      jdText: "Python engineer required.",
      admin: true,
    });
    expect((await analyse(extraField)).status).toBe(400);
  });

  it("rejects blank and oversized input", async () => {
    const blank = jsonRequest("/api/analyse", "POST", { cvText: " ", jdText: "Role" });
    expect((await analyse(blank)).status).toBe(400);

    const oversized = jsonRequest("/api/analyse", "POST", {
      cvText: "x".repeat(50_001),
      jdText: "Role",
    });
    expect((await analyse(oversized)).status).toBe(400);
  });

  it("returns an evidence-grounded analysis for valid input", async () => {
    const request = jsonRequest("/api/analyse", "POST", {
      cvText: "Experience\nBuilt Python data pipelines using pandas.",
      jdText: "Python engineer required. Kubernetes experience required.",
    });
    const response = await analyse(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.coverLetter.letter.toLowerCase()).not.toContain("kubernetes");
    expect(payload.coverLetter.blockedClaims).toContain("Kubernetes");
  });
});

describe("approval queue API", () => {
  it("rejects invalid action types, unknown jobs and unexpected fields", async () => {
    const invalidAction = jsonRequest("/api/approval-queue", "POST", {
      jobId: TEST_JOB.id,
      actionType: "send_email",
      proposedContent: "Send this automatically.",
    });
    expect((await createApproval(invalidAction)).status).toBe(400);

    const unknownJob = jsonRequest("/api/approval-queue", "POST", {
      jobId: "missing",
      actionType: "mark_stale",
      proposedContent: "Close this application.",
    });
    expect((await createApproval(unknownJob)).status).toBe(404);

    const extraField = jsonRequest("/api/approval-queue", "POST", {
      jobId: TEST_JOB.id,
      actionType: "mark_stale",
      proposedContent: "Close this application.",
      approved: true,
    });
    expect((await createApproval(extraField)).status).toBe(400);
  });

  it("deduplicates pending proposals and rejects replayed decisions", async () => {
    const firstResponse = await createApproval(
      jsonRequest("/api/approval-queue", "POST", {
        jobId: TEST_JOB.id,
        actionType: "mark_stale",
        proposedContent: "Close this application.",
      }),
    );
    const first = await firstResponse.json();

    const secondResponse = await createApproval(
      jsonRequest("/api/approval-queue", "POST", {
        jobId: TEST_JOB.id,
        actionType: "mark_stale",
        proposedContent: "Different duplicate text.",
      }),
    );
    const second = await secondResponse.json();

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
    expect(second.item.id).toBe(first.item.id);
    expect(listApprovalQueue()).toHaveLength(1);

    const approved = await resolveApproval(
      jsonRequest("/api/approval-queue", "PATCH", {
        id: first.item.id,
        decision: "approved",
      }),
    );
    expect(approved.status).toBe(200);

    const replay = await resolveApproval(
      jsonRequest("/api/approval-queue", "PATCH", {
        id: first.item.id,
        decision: "approved",
      }),
    );
    expect(replay.status).toBe(409);
  });
});
