# Safety rules — Agentic Job Application Tracker (Project 7 addendum)

Extends the base `docs/security/safety-rules.md`. Specific to the
tracker/automation layer:

1. **Three independent layers, each a chance to not act:**
   `findJobsNeedingAction` only computes suggestions (pure function, no
   side effects) → `addApprovalQueueItem` only ever creates a `pending`
   item → `resolveApprovalQueueItem` only changes job state when called
   with `"approved"`, and only from an explicit human action in the UI.
2. The n8n workflow (`n8n/follow-up-workflow.json`) has exactly two HTTP
   nodes: a read (`GET /api/jobs/needs-follow-up`) and a write that only
   creates pending items (`POST /api/approval-queue`). There is no email,
   messaging, or LinkedIn node anywhere in the workflow file — this is
   enforced by what nodes exist, not just by a comment saying not to add
   them.
3. Approving a `draft_follow_up` action never sends anything — there is
   no send capability anywhere in this codebase. It only marks the queue
   item approved; the actual sending, if any, is a manual step for the
   user outside this app.
4. Interview prep reuses Project 5's `generateInterviewQuestions`
   directly rather than a re-implementation, so there's no risk of the
   two diverging.
