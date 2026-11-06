import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resumeText = String(body.resumeText || "");
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];

    if (resumeText.length < 30) {
      return NextResponse.json(
        { success: false, message: "Resume text is missing." },
        { status: 400 }
      );
    }

    if (!jobs.length) {
      return NextResponse.json(
        { success: false, message: "No jobs supplied for matching." },
        { status: 400 }
      );
    }

    const selectedJobs = jobs.slice(0, 50);

    const response = await fetch(`${ML_API_URL}/similarity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        job_descriptions: selectedJobs.map((job: any) =>
          [
            job.title,
            job.company,
            job.location,
            ...(job.tags || []),
            job.description || "",
          ].join(" ").slice(0, 8000)
        ),
      }),
      signal: AbortSignal.timeout(55000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);

      return NextResponse.json(
        {
          success: false,
          message: error?.detail || "ML matching failed.",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    const rankedJobs = (result.results || [])
      .map((item: any) => {
        const job = selectedJobs[item.job_index];

        if (!job) return null;

        return {
          ...job,
          similarity: item.similarity,
          similarityPercent: item.similarity_percent,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      model: result.model,
      count: rankedJobs.length,
      jobs: rankedJobs,
    });

  } catch (error) {
    console.error("Recommendation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not connect to the ML matching service. Check that FastAPI is running.",
      },
      { status: 503 }
    );
  }
}
