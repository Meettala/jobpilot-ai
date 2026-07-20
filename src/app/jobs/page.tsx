"use client";

import { useCallback, useEffect, useState } from "react";

type Job = {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  followUpDate: string;
  lastStatusChange: string;
};

type Suggestion = {
  jobId: string;
  actionType: "draft_follow_up" | "mark_stale";
  reason: string;
  proposedContent: string;
};

type QueueItem = {
  id: string;
  jobId: string;
  actionType: string;
  proposedContent: string;
  status: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [jobsRes, suggRes, queueRes] = await Promise.all([
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/jobs/needs-follow-up").then((r) => r.json()),
      fetch("/api/approval-queue").then((r) => r.json()),
    ]);
    setJobs(jobsRes.jobs);
    setSuggestions(suggRes.suggestions);
    setQueue(queueRes.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function proposeAction(s: Suggestion) {
    await fetch("/api/approval-queue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId: s.jobId, actionType: s.actionType, proposedContent: s.proposedContent }),
    });
    refresh();
  }

  async function resolve(id: string, decision: "approved" | "rejected") {
    await fetch("/api/approval-queue", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    refresh();
  }

  if (loading) return <div className="p-16 text-center">Loading...</div>;

  const pendingQueue = queue.filter((q) => q.status === "pending");
  const jobById = (id: string) => jobs.find((j) => j.id === id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 font-sans">
      <h1 className="text-3xl font-bold">Application Tracker</h1>
      <p className="mt-2 text-gray-600">
        Suggested actions require your approval — nothing is sent or changed automatically.
      </p>

      {suggestions.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-amber-700">New suggestions</h2>
          <div className="mt-3 space-y-3">
            {suggestions
              .filter((s) => !queue.some((q) => q.jobId === s.jobId && q.actionType === s.actionType && q.status === "pending"))
              .map((s) => (
                <div key={`${s.jobId}-${s.actionType}`} className="rounded border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold">{jobById(s.jobId)?.jobTitle} at {jobById(s.jobId)?.company}</p>
                  <p className="mt-1 text-xs text-gray-600">{s.reason}</p>
                  <p className="mt-2 text-sm italic">&quot;{s.proposedContent}&quot;</p>
                  <button onClick={() => proposeAction(s)} className="mt-3 rounded bg-black px-4 py-1.5 text-xs text-white">
                    Add to approval queue
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {pendingQueue.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Pending approval</h2>
          <div className="mt-3 space-y-3">
            {pendingQueue.map((q) => (
              <div key={q.id} className="rounded border border-gray-200 p-4">
                <p className="text-sm font-semibold">{jobById(q.jobId)?.jobTitle} — {q.actionType}</p>
                <p className="mt-2 text-sm italic">&quot;{q.proposedContent}&quot;</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => resolve(q.id, "approved")} className="rounded bg-green-700 px-4 py-1.5 text-xs text-white">Approve</button>
                  <button onClick={() => resolve(q.id, "rejected")} className="rounded bg-gray-300 px-4 py-1.5 text-xs">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold">All applications</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-gray-500">
              <th className="py-2">Role</th>
              <th>Company</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b">
                <td className="py-2">{j.jobTitle}</td>
                <td>{j.company}</td>
                <td className="capitalize">{j.status}</td>
                <td>{j.followUpDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
