"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { calculateATSScore } from "@/lib/ats";
import { calculateResumeScore } from "@/lib/scoring";
import {
  extractSkills,
  findMissingSkills,
} from "@/lib/matcher";
import { generateRecommendations } from "@/lib/recommendation";

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

export default function DashboardPage() {
  const router = useRouter();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResume = sessionStorage.getItem("resumeAnalysis");

    if (!storedResume) {
      router.replace("/upload");
      return;
    }

    try {
      const data = JSON.parse(storedResume);
      setResume(data);
    } catch (error) {
      console.error("Failed to load resume:", error);
      router.replace("/upload");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-slate-600">
            Analyzing your resume...
          </p>
        </div>
      </main>
    );
  }

  if (!resume) {
    return null;
  }

  const resumeText = resume.extractedText || "";

  const atsResult = calculateATSScore(resumeText);
  const resumeResult = calculateResumeScore(resumeText);
  const skills = extractSkills(resumeText);
  const missingSkills = findMissingSkills(resumeText);
  const recommendations = generateRecommendations(resumeText);

  return (
    <main className="min-h-screen bg-slate-50">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/jobs")}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Find Jobs
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Dashboard
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Resume Analysis
          </h2>

          <p className="mt-2 text-slate-600">
            Analysis results for{" "}
            <span className="font-medium text-slate-900">
              {resume.file?.originalName || "your resume"}
            </span>
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              ATS Score
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {atsResult.score}
              </span>
              <span className="mb-1 text-sm text-slate-500">
                / 100
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${atsResult.score}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Resume Score
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {resumeResult.score}
              </span>
              <span className="mb-1 text-sm text-slate-500">
                / 100
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${resumeResult.score}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Skills Detected
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {skills.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              relevant skills found
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Resume Words
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {resumeResult.wordCount}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              words analyzed
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Skills Detected
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Skills identified from your resume.
              </p>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No matching skills were detected.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Skills You Could Add
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Common skills that were not detected.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              ATS Keyword Analysis
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Keywords detected against our current ATS keyword set.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">
                Keyword Match
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.keywordMatchPercentage}%
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Keywords Found
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.matchedKeywords.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Keywords Missing
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.missingKeywords.length}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Resume Sections
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sections identified in your resume.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {resumeResult.sectionsFound.map((section) => (
              <span
                key={section}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium capitalize text-slate-700"
              >
                ✓ {section}
              </span>
            ))}

            {resumeResult.sectionsMissing.map((section) => (
              <span
                key={section}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm capitalize text-slate-500"
              >
                {section}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Recommended Jobs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Job roles matched to your resume.
              </p>
            </div>

            <button
              onClick={() => router.push("/recommendations")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((job) => (
              <div
                key={job.title}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {job.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.company}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.location}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {job.match}% match
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {job.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => router.push("/analyze")}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-white"
          >
            View Resume
          </button>

          <button
            onClick={() => router.push("/jobs")}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Explore Jobs →
          </button>
        </div>
      </div>
    </main>
  );
}
