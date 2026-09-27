"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ResumeData = {
  file?: {
    originalName: string;
    savedName: string;
    size: number;
    type: string;
  };
  extractedText?: string;
  textLength?: number;
};

export default function AnalyzePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const storedResume = sessionStorage.getItem("resumeAnalysis");

    if (!storedResume) {
      router.replace("/upload");
      return;
    }

    try {
      const data = JSON.parse(storedResume);
      setResume(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to read resume data:", error);
      router.replace("/upload");
    }
  }, [router]);

  /*
   * Do not render browser-dependent content during
   * the initial server/client hydration.
   */
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="text-slate-600">
            Preparing your resume analysis...
          </p>
        </div>
      </main>
    );
  }

  if (!resume) {
    return null;
  }

  const text = resume.extractedText || "";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              CareerMatch
            </h1>

            <p className="text-sm text-slate-500">
              Resume Analyzer
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Resume Analysis
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Resume Preview
          </h2>
        </div>

        {/* Resume Information */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Resume Name */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Resume
            </p>

            <h3 className="mt-2 break-words text-lg font-semibold text-slate-900">
              {resume.file?.originalName || "Uploaded Resume"}
            </h3>
          </div>

          {/* Character Count */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Extracted Characters
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {resume.textLength || text.length}
            </h3>
          </div>
        </section>

        {/* Extracted Resume Text */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Extracted Resume Text
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your resume content is ready for analysis.
            </p>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
              {text}
            </pre>
          </div>
        </section>

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Continue to Analysis →
          </button>
        </div>
      </div>
    </main>
  );
}