# Importing the follow-up workflow into n8n

This workflow demonstrates automated *proposing*, never automated
*acting* — it mirrors the in-app suggestion logic exactly and writes
only to the pending approval queue.

## What it does
1. Runs once a day (Schedule Trigger).
2. Calls `GET /api/jobs/needs-follow-up` on your deployed JobPilot AI
   instance — a read-only endpoint.
3. For each suggestion returned, calls `POST /api/approval-queue` —
   which only ever creates a `pending` item.
4. Stops. Nothing is sent. You approve or reject each item yourself on
   the app's `/jobs` page.

## Import steps (you'll need an n8n account — n8n Cloud or self-hosted)
1. In n8n: **Workflows → Import from File** → select `follow-up-workflow.json`.
2. Set the `JOBPILOT_APP_URL` environment variable in n8n to your
   deployed JobPilot AI URL (e.g. `https://jobpilot-ai.vercel.app`).
3. Activate the workflow.

## What this workflow deliberately cannot do
No node in this workflow has email, Slack, LinkedIn, or any
messaging-service credentials — there's nothing to configure for sending,
because sending isn't part of what this workflow does. That's enforced
by what nodes exist in the file, not just by instruction.
