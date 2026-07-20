import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center font-sans">
      <h1 className="text-4xl font-bold">JobPilot AI</h1>
      <p className="mt-4 text-gray-600">
        An evidence-grounded job application assistant. It analyses, drafts, and prepares —
        it never invents experience, and never sends anything without your approval.
      </p>
      <Link href="/analyse" className="mt-8 inline-block rounded bg-black px-6 py-3 text-white">
        Analyse a job
      </Link>
    </div>
  );
}
