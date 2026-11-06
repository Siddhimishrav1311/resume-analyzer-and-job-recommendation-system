"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  tags: string[];
  jobType: string;
  url: string;
  postedAt?: string | null;
  source?: string;
  similarityPercent: number;
};

function getMatchLabel(score: number) {
  if (score >= 70) return "Strong semantic match";
  if (score >= 50) return "Moderate semantic match";
  if (score >= 30) return "Partial semantic match";
  return "Low semantic match";
}

function getInitials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date?: string | null) {
  if (!date) return "Date not provided";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not provided";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JobCard({ job }: { job: Job }) {
  const score = Number(job.similarityPercent);
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, score))
    : 0;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:border-slate-300 hover:shadow-lg">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg font-bold text-slate-700">
          {getInitials(job.company)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-6 text-slate-900 transition group-hover:text-indigo-700">
                {job.title}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {job.company}
              </p>
            </div>

            <div className="min-w-[110px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <p className="text-xl font-bold text-slate-900">
                {safeScore.toFixed(1)}%
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Similarity
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span>⌖</span>
              {job.location || "Location not specified"}
            </span>

            {job.remote && (
              <span className="flex items-center gap-1.5">
                <span>◉</span>
                Remote
              </span>
            )}

            <span>{job.jobType || "Job type not specified"}</span>

            <span>Posted: {formatDate(job.postedAt)}</span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-700">
              {getMatchLabel(safeScore)}
            </span>
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
              {job.description || "Description not available from the listing source."}
            </p>
          </div>

          {job.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.slice(0, 7).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">
              Source: {job.source || "External job listing"}
            </span>

            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                View original listing
                <span>↗</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400">
                Application URL unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RecommendationsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("match");

  useEffect(() => {
    let active = true;

    async function generate() {
      try {
        const stored = sessionStorage.getItem("resumeAnalysis");

        if (!stored) {
          router.replace("/");
          return;
        }

        const resume = JSON.parse(stored);
        const resumeText = resume.extractedText || "";

        if (resumeText.length < 30) {
          throw new Error("Resume text is missing. Upload your resume again.");
        }

        const feedResponse = await fetch("/api/jobs");
        const feed = await feedResponse.json();

        if (!feedResponse.ok || !feed.success) {
          throw new Error(feed.message || "Job listings could not be loaded.");
        }

        const matchResponse = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            jobs: feed.jobs,
          }),
        });

        const matchResult = await matchResponse.json();

        if (!matchResponse.ok || !matchResult.success) {
          throw new Error(matchResult.message || "Job matching failed.");
        }

        if (active) {
          setJobs(matchResult.jobs || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to generate recommendations."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    generate();

    return () => {
      active = false;
    };
  }, [router]);

  const visibleJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      const query = search.toLowerCase().trim();

      const content = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...(job.tags || []),
      ].join(" ").toLowerCase();

      return (
        (!query || content.includes(query)) &&
        (!remoteOnly || job.remote)
      );
    });

    if (sort === "match") {
      result = [...result].sort(
        (a, b) => b.similarityPercent - a.similarityPercent
      );
    } else if (sort === "recent") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.postedAt || 0).getTime() -
          new Date(a.postedAt || 0).getTime()
      );
    }

    return result;
  }, [jobs, search, remoteOnly, sort]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-bold tracking-tight"
          >
            CareerMatch
          </button>

          <nav className="flex items-center gap-5 text-sm">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/jobs")}
              className="text-slate-600 hover:text-slate-900"
            >
              Explore jobs
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="border-b border-slate-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            CareerMatch / Recommendations
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Recommended opportunities
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Job listings ranked by semantic similarity between your uploaded
            resume and the available job descriptions.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Listings matched
            </p>
            <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Displayed results
            </p>
            <p className="mt-2 text-3xl font-bold">{visibleJobs.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Ranking method
            </p>
            <p className="mt-2 text-lg font-semibold">Semantic matching</p>
          </div>
        </div>

        <div className="mt-7 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search job title, company, location or skill..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="match">Sort by similarity</option>
              <option value="recent">Sort by date</option>
            </select>

            <label className="flex items-center gap-2 px-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) => setRemoteOnly(event.target.checked)}
              />
              Remote only
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Matching jobs</h2>
            <p className="mt-1 text-xs text-slate-500">
              {visibleJobs.length} results available
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Update resume
          </button>
        </div>

        {loading && (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-7"
              >
                <div className="h-5 w-1/3 rounded bg-slate-200" />
                <div className="mt-4 h-3 w-1/4 rounded bg-slate-100" />
                <div className="mt-6 h-3 w-full rounded bg-slate-100" />
                <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">
              Unable to generate recommendations
            </p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && visibleJobs.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
            <h3 className="font-semibold">No matching jobs found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search or remove the remote filter.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="mt-5 space-y-4">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs leading-5 text-slate-500">
            Data source: Arbeitnow. Listings are primarily European and remote
            technology opportunities. Similarity scores represent model-based
            text similarity, not hiring probability or eligibility. Confirm
            the original listing and requirements with the employer before
            applying.
          </p>
        </div>
      </section>
    </main>
  );
}





