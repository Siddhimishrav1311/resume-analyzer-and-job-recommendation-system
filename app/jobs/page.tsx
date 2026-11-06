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
  postedAt: string | null;
  url: string;
};

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load jobs.");
        }

        setJobs(result.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Job feed unavailable.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return jobs.filter((job) => {
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
  }, [jobs, search, remoteOnly]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={() => router.push("/")} className="text-xl font-bold tracking-tight">
            CareerMatch
          </button>

          <nav className="flex items-center gap-3 text-sm">
            <button onClick={() => router.push("/dashboard")} className="text-slate-600 hover:text-slate-900">
              Dashboard
            </button>
            <button onClick={() => router.push("/recommendations")} className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white">
              For you
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">
            Explore opportunities
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find your next role.
          </h1>
          <p className="mt-4 text-slate-600">
            Discover current job listings and explore roles by title, company, location or skill.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Python, data engineer, analyst..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
            <label className="flex items-center gap-2 px-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) => setRemoteOnly(event.target.checked)}
              />
              Remote only
            </label>
            <button
              onClick={() => router.push("/recommendations")}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Match my resume
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Latest opportunities</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredJobs.length} listings
            </p>
          </div>
          <span className="text-xs text-slate-500">Source: Arbeitnow</span>
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-500">
            Loading current job listings...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <h3 className="font-semibold">No matching listings found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different keyword or remove the remote filter.
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                </div>
                {job.remote && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Remote
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-slate-500">{job.location}</p>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {job.description || "Open the original listing for details."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {job.jobType.replaceAll("_", " ")}
                </span>
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                    View & Apply ↗
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Application link unavailable</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-400">
          Listings are provided by Arbeitnow and are primarily focused on European and remote technology roles. Always verify role availability and eligibility on the employer's application page.
        </p>
      </section>
    </main>
  );
}




