"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { calculateATSScore } from "@/lib/ats";
import { calculateResumeScore } from "@/lib/scoring";

type Analysis = {
  model?: string;
  entities?: Record<string, string[]>;
  contact?: {
    email?: string | null;
    phone?: string[];
    location?: string[];
  };
  education?: {
    degrees?: string[];
    institutions?: string[];
  };
  experience?: {
    job_titles?: string[];
    companies?: string[];
    dates?: string[];
  };
  skills?: {
    ner_extracted?: unknown[];
    esco?: unknown[];
    technical?: unknown[];
  };
  statistics?: {
    ner_entity_count?: number;
    esco_skill_count?: number;
    technical_skill_count?: number;
  };
};

type ResumeData = {
  file?: {
    originalName?: string;
    savedName?: string;
    size?: number;
    type?: string;
  };
  extractedText?: string;
  textLength?: number;
  analysis?: Analysis;
};

function normalizeSkills(items: unknown[] = []): string[] {
  return items
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const value = item as Record<string, unknown>;

        const keys = [
          "label",
          "name",
          "preferredLabel",
          "preferred_label",
          "skill",
          "title",
          "skill_label",
          "preferredName",
        ];

        for (const key of keys) {
          if (typeof value[key] === "string") {
            return value[key] as string;
          }
        }
      }

      return "";
    })
    .filter((value): value is string => Boolean(value));
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No information detected.
        </p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResume = sessionStorage.getItem("resumeAnalysis");

    if (!storedResume) {
      router.replace("/");
      return;
    }

    try {
      const data = JSON.parse(storedResume) as ResumeData;

      if (!data.analysis) {
        router.replace("/");
        return;
      }

      setResume(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load resume:", error);
      router.replace("/");
    }
  }, [router]);

  if (loading || !resume) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-slate-600">Preparing your resume analysis...</p>
        </div>
      </main>
    );
  }

  const analysis = resume.analysis!;
  const resumeText = resume.extractedText || "";

  // Existing ATS and resume scoring functions
  const atsResult = calculateATSScore(resumeText);
  const resumeResult = calculateResumeScore(resumeText);

  // Combine all skill sources into one section
  const skillData = analysis.skills || {};

  const skills = Array.from(
    new Set([
      ...normalizeSkills(skillData.technical),
      ...normalizeSkills(skillData.esco),
      ...normalizeSkills(skillData.ner_extracted),
    ])
  );

  const contact = analysis.contact || {};
  const education = analysis.education || {};
  const experience = analysis.experience || {};

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

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              New Resume
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
            Results for{" "}
            <span className="font-semibold text-slate-900">
              {resume.file?.originalName || "your resume"}
            </span>
          </p>
        </div>

        {/* SCORE CARDS */}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              ATS Score
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {atsResult.score}
              <span className="text-lg text-slate-400"> / 100</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.max(0, Math.min(100, atsResult.score))}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Rule-based ATS compatibility estimate
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Resume Score
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {resumeResult.score}
              <span className="text-lg text-slate-400"> / 100</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.max(0, Math.min(100, resumeResult.score))}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Technical Skills
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {skills.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Skills identified
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Resume Words
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {resumeResult.wordCount}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Words analyzed
            </p>
          </div>
        </section>

        {/* SKILLS */}

        <section className="mt-8">
          <Section
            title="Technical Skills"
            items={skills}
          />
        </section>

        {/* ATS KEYWORD ANALYSIS */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            ATS Keyword Analysis
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Keywords identified using your existing ATS keyword analysis.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Keyword Match</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.keywordMatchPercentage}%
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Keywords Found</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.matchedKeywords.length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Keywords Missing</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {atsResult.missingKeywords.length}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Section
              title="Keywords Found"
              items={atsResult.matchedKeywords}
            />

            <Section
              title="Suggested Keywords"
              items={atsResult.missingKeywords}
            />
          </div>
        </section>

        {/* RESUME SECTIONS */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Resume Sections
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            {resumeResult.sectionsFound.map((section) => (
              <span
                key={section}
                className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium capitalize text-green-700"
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

        {/* EDUCATION AND EXPERIENCE */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <Section
            title="Education"
            items={[
              ...(education.degrees || []),
              ...(education.institutions || []),
            ]}
          />

          <Section
            title="Experience"
            items={[
              ...(experience.job_titles || []),
              ...(experience.companies || []),
              ...(experience.dates || []),
            ]}
          />
        </section>

        {/* ACTIONS */}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => router.push("/recommendations")}
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-white"
          >
            View Resume
          </button>

          <button
            onClick={() => router.push("/jobs")}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Explore Jobs
          </button>
        </div>
      </div>
    </main>
  );
}






