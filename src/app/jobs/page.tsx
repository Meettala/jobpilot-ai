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

type TrackerData = {
  jobs: Job[];
  suggestions: Suggestion[];
  queue: QueueItem[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Tracker data could not be loaded");
  return response.json() as Promise<T>;
}

async function loadTrackerData(): Promise<TrackerData> {
  const [jobsRes, suggestionsRes, queueRes] = await Promise.all([
    fetchJson<{ jobs: Job[] }>("/api/jobs"),
    fetchJson<{ suggestions: Suggestion[] }>("/api/jobs/needs-follow-up"),
    fetchJson<{ items: QueueItem[] }>("/api/approval-queue"),
  ]);

  return {
    jobs: jobsRes.jobs,
    suggestions: suggestionsRes.suggestions,
    queue: queueRes.items,
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyTrackerData = useCallback((data: TrackerData) => {
    setJobs(data.jobs);
    setSuggestions(data.suggestions);
    setQueue(data.queue);
    setError("");
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      applyTrackerData(await loadTrackerData());
    } catch {
      setError("The tracker could not be refreshed. Please try again.");
      setLoading(false);
    }
  }, [applyTrackerData]);

  useEffect(() => {
    let active = true;

    void loadTrackerData()
      .then((data) => {
        if (active) applyTrackerData(data);
      })
      .catch(() => {
        if (active) {
          setError("The tracker could not be loaded. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applyTrackerData]);

  async function proposeAction(s: Suggestion) {
    const response = await fetch("/api/approval-queue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId: s.jobId, actionType: s.actionType, proposedContent: s.proposedContent }),
    });
    if (!response.ok) {
      setError("The suggested action could not be added to the approval queue.");
      return;
    }
    await refresh();
  }

  async function resolve(id: string, decision: "approved" | "rejected") {
    const response = await fetch("/api/approval-queue", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    if (!response.ok) {
      setError("The approval decision could not be saved.");
      return;
    }
    await refresh();
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

      {error && (
        <div role="alert" className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

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
                  <button onClick={() => void proposeAction(s)} className="mt-3 rounded bg-black px-4 py-1.5 text-xs text-white">
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
                  <button onClick={() => void resolve(q.id, "approved")} className="rounded bg-green-700 px-4 py-1.5 text-xs text-white">Approve</button>
                  <button onClick={() => void resolve(q.id, "rejected")} className="rounded bg-gray-300 px-4 py-1.5 text-xs">Reject</button>
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
