# Tracker test notes — Project 7

`tests/tracker.test.ts` (9 tests, all passing):

- Suggestion logic: correctly flags overdue follow-ups and stale
  applications, never flags closed/rejected jobs or jobs with no issue.
- **The core guarantee**, tested directly: adding a suggestion to the
  approval queue does not change job status; rejecting an item never
  changes job state; only an explicit "approved" decision changes state,
  and even then only for `mark_stale` (there is no job-state effect for
  an approved `draft_follow_up` — it's a draft, not a send); re-resolving
  an already-resolved item is a no-op rather than re-firing the action.
