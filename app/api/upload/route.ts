import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { extractText } from "unpdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ML_API_URL =
  process.env.ML_API_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No resume file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF and DOCX files are supported.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must be less than 5 MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    if (file.type === "application/pdf") {
      const result = await extractText(new Uint8Array(buffer));

      extractedText = Array.isArray(result.text)
        ? result.text.join("\n")
        : result.text;
    } else {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (extractedText.length < 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not extract enough text from this resume.",
        },
        { status: 422 }
      );
    }

    const uploadDirectory = path.join(process.cwd(), "uploads");

    await fs.mkdir(uploadDirectory, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const savedName = `${Date.now()}-${safeName}`;

    await fs.writeFile(
      path.join(uploadDirectory, savedName),
      buffer
    );

    let mlResponse: Response;

    try {
      mlResponse = await fetch(`${ML_API_URL}/analyze-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: extractedText,
        }),
        signal: AbortSignal.timeout(55000),
      });
    } catch (error) {
      console.error("ML backend connection failed:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            "Resume saved, but the ML backend is unavailable. Start FastAPI and try again.",
        },
        { status: 503 }
      );
    }

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json().catch(() => null);

      return NextResponse.json(
        {
          success: false,
          message: errorData?.detail || "ML analysis failed.",
        },
        { status: mlResponse.status }
      );
    }

    const mlResult = await mlResponse.json();

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and analyzed successfully.",
      file: {
        originalName: file.name,
        savedName,
        size: file.size,
        type: file.type,
      },
      extractedText,
      textLength: extractedText.length,
      analysis: mlResult.analysis,
    });

  } catch (error) {
    console.error("Resume upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error during resume processing.",
      },
      { status: 500 }
    );
  }
}
