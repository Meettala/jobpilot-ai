"use client";

import { useState } from "react";

const SAMPLE_CV = `Summary
AI/ML engineer with hands-on project experience building and shipping small tools.

Experience
Built a machine learning pipeline in Python using pandas and scikit-learn to predict housing prices, evaluating with RMSE and R-squared.
Developed a RAG system using retrieval augmented generation and the OpenAI API to answer questions from uploaded documents, with citations.
Deployed services with Docker and used Git for version control throughout every project.

Projects
Created a SQL-based analytics dashboard using Tableau for data visualization of job market trends.

Education
BSc Computer Science.`;

const SAMPLE_JD = `Junior Machine Learning Engineer

We need someone with strong Python and SQL skills, and hands-on machine learning and pandas experience.
Familiarity with AWS is preferred but not required.
Experience with Docker is a plus.`;

type AnalysisResponse = {
  match: {
    matchScore: number;
    matchLevel: "strong" | "partial" | "weak" | "occupational_mismatch";
    matchLabel: string;
    matchSummary: string;
    requiredCoverage: number;
    reasons: string[];
    matchedSkills: { skill: string; confidence: string }[];
    missingSkills: string[];
    weakEvidence: { skill: string; reason: string }[];
  };
  coverLetter: { letter: string; blockedClaims: string[]; mode: string };
  interviewQuestions: { technical: string[]; behavioural: string[]; toAskEmployer: string[] };
  linkedin: { headline: string; aboutSectionPoints: string[]; skillsToAdd: string[] };
  markdown: string;
};

export default function AnalysePage() {
  const [cvText, setCvText] = useState(SAMPLE_CV);
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyse() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cvText, jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadMarkdown() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobpilot-analysis.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 font-sans">
      <h1 className="text-3xl font-bold">Analyse a job application</h1>
      <p className="mt-2 text-gray-600">Every suggestion below is grounded in your CV. Nothing is invented — unsupported claims are listed separately, not hidden.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Your CV</label>
          <textarea className="mt-2 h-64 w-full rounded border border-gray-300 p-3 font-mono text-xs" value={cvText} onChange={(e) => setCvText(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Job description</label>
          <textarea className="mt-2 h-64 w-full rounded border border-gray-300 p-3 font-mono text-xs" value={jdText} onChange={(e) => setJdText(e.target.value)} />
        </div>
      </div>

      <button onClick={handleAnalyse} disabled={loading} className="mt-6 rounded bg-black px-6 py-3 text-white disabled:opacity-50">
        {loading ? "Analysing..." : "Analyse"}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-bold">Match score: {result.match.matchScore}%</h2>
            <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold">Verdict: {result.match.matchLabel}</p>
              <p className="mt-1 text-sm text-gray-700">{result.match.matchSummary}</p>
              <p className="mt-2 text-sm"><strong>Required coverage:</strong> {result.match.requiredCoverage}%</p>
              <ul className="mt-2 text-sm text-gray-700">
                {result.match.reasons.map((reason) => <li key={reason}>• {reason}</li>)}
              </ul>
              <p className="mt-3 text-xs text-gray-500">This is an evidence-alignment assessment, not proof that a candidate can perform the job. Employers must still verify experience, licences and eligibility.</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-green-700">Matched</p>
                <ul className="mt-1 text-sm">{result.match.matchedSkills.map((s) => <li key={s.skill}>{s.skill} ({s.confidence})</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-red-700">Missing</p>
                <ul className="mt-1 text-sm">{result.match.missingSkills.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-amber-700">Weak evidence</p>
                <ul className="mt-1 text-sm">{result.match.weakEvidence.map((w) => <li key={w.skill}>{w.skill}: {w.reason}</li>)}</ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">Cover letter ({result.coverLetter.mode})</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-4 text-sm">{result.coverLetter.letter}</pre>
            {result.coverLetter.blockedClaims.length > 0 && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <strong>Blocked claims</strong> (not included above — no supporting evidence found): {result.coverLetter.blockedClaims.join(", ")}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold">Interview prep</h2>
            <p className="mt-2 text-sm font-semibold">Technical</p>
            <ul className="text-sm">{result.interviewQuestions.technical.map((q, i) => <li key={i}>• {q}</li>)}</ul>
            <p className="mt-3 text-sm font-semibold">Behavioural</p>
            <ul className="text-sm">{result.interviewQuestions.behavioural.map((q, i) => <li key={i}>• {q}</li>)}</ul>
            <p className="mt-3 text-sm font-semibold">Ask the employer</p>
            <ul className="text-sm">{result.interviewQuestions.toAskEmployer.map((q, i) => <li key={i}>• {q}</li>)}</ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">LinkedIn suggestions</h2>
            <p className="mt-2 text-sm"><strong>Headline:</strong> {result.linkedin.headline}</p>
            <p className="mt-1 text-sm"><strong>Skills to add:</strong> {result.linkedin.skillsToAdd.join(", ")}</p>
          </section>

          <button onClick={downloadMarkdown} className="rounded border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50">
            Export as Markdown
          </button>
        </div>
      )}
    </div>
  );
}
