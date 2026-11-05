import { NextResponse } from "next/server";
import { generateResumeEmbedding } from "@/lib/embeddings";

export async function GET() {
  try {
    const result = await generateResumeEmbedding(
      "Software engineer with experience in Python, SQL, machine learning, React and PostgreSQL."
    );

    return NextResponse.json({
      success: true,
      model: result.model,
      dimensions: result.dimensions,
      firstFiveValues: result.embedding.slice(0, 5),
    });
  } catch (error) {
    console.error("Embedding test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Embedding generation failed.",
      },
      { status: 500 }
    );
  }
}