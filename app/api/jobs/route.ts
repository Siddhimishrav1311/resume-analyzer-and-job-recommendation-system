import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "1";

    const response = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?page=${encodeURIComponent(page)}`,
      {
        next: { revalidate: 1800 },
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Job provider returned ${response.status}`);
    }

    const payload = await response.json();
    const rawJobs = Array.isArray(payload.data) ? payload.data : [];

    const jobs = rawJobs.map((job: any) => ({
      id: job.slug || job.url,
      title: job.title || "Untitled role",
      company: job.company_name || "Company not specified",
      location: job.location || (job.remote ? "Remote" : "Not specified"),
      remote: Boolean(job.remote),
      description: String(job.description || "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim(),
      tags: Array.isArray(job.tags) ? job.tags : [],
      jobType: Array.isArray(job.job_types)
        ? job.job_types.join(", ")
        : "Not specified",
      postedAt: job.created_at
        ? new Date(job.created_at * 1000).toISOString()
        : null,
      url: job.url || "",
      source: "Arbeitnow",
    }));

    return NextResponse.json({
      success: true,
      source: "Arbeitnow",
      coverage: "Primarily European and remote technology listings",
      jobs,
      count: jobs.length,
      page: Number(page),
    });

  } catch (error) {
    console.error("Job feed error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve live jobs right now.",
        jobs: [],
      },
      { status: 502 }
    );
  }
}
