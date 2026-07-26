# Importing the follow-up workflow into n8n

This workflow demonstrates automated **proposing**, never automated acting. It mirrors the in-app suggestion logic and writes only to the pending approval queue.

## Demo behaviour

1. Runs once a day using a Schedule Trigger.
2. Calls `GET /api/jobs/needs-follow-up` on the deployed JobPilot AI instance.
3. Splits the returned suggestions.
4. Calls `POST /api/approval-queue` for each suggestion.
5. Stops. Nothing is sent and no application state changes automatically.

A user must open `/jobs` and explicitly approve or reject every pending item.

## Import steps for a local or isolated demo

1. In n8n, choose **Workflows → Import from File**.
2. Select `follow-up-workflow.json`.
3. Set `JOBPILOT_APP_URL` to an HTTPS JobPilot deployment URL.
4. Keep the workflow inactive until the endpoint protections below are implemented.

## Production security requirements

The repository workflow is an architectural example, not a production-secure integration. Before enabling it against real user data:

- Require a server-side automation secret or signed request on both endpoints.
- Store the secret in n8n credentials or environment variables, never in the workflow JSON.
- Add authentication headers through n8n’s credential system.
- Enforce HTTPS and reject unexpected hosts.
- Add rate limiting, request IDs and audit logging.
- Prevent duplicate workflow runs from creating repeated actions.
- Rotate credentials and document revocation procedures.
- Scope the endpoint to the authenticated user or service identity.
- Test that pending items cannot bypass the explicit approval route.

The current public demo does not yet implement these production controls, so the workflow should remain disabled outside an isolated demonstration.

## Deliberately excluded capabilities

No node in the workflow has email, Slack, LinkedIn, job-board, browser-automation or application-submission credentials. There is no sending node and no path that approves an item automatically.

Adding any external communication or application action would require a separate private, governed production design with human review, platform-policy checks and auditable consent.
