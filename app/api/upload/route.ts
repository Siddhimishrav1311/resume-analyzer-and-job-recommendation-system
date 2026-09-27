import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { extractText } from "unpdf";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No resume file uploaded.",
        },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
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
          message: "Resume size must be less than 5 MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // ================================
    // PDF TEXT EXTRACTION
    // ================================

    if (extension === ".pdf") {
      const result = await extractText(new Uint8Array(buffer));

      extractedText = result.text.join("\n");
    }

    // ================================
    // DOCX TEXT EXTRACTION
    // ================================

    if (extension === ".docx") {
      const result = await mammoth.extractRawText({
        buffer,
      });

      extractedText = result.value;
    }

    // ================================
    // CLEAN TEXT
    // ================================

    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // ================================
    // CHECK EXTRACTION
    // ================================

    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No text could be extracted. Please upload a text-based PDF or DOCX resume.",
        },
        { status: 400 }
      );
    }

    // ================================
    // SAVE RESUME
    // ================================

    const uploadDirectory = path.join(process.cwd(), "uploads");

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    const safeFileName = `${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )}`;

    const filePath = path.join(uploadDirectory, safeFileName);

    await fs.writeFile(filePath, buffer);

    // ================================
    // SUCCESS
    // ================================

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and text extracted successfully.",

      file: {
        originalName: file.name,
        savedName: safeFileName,
        size: file.size,
        type: file.type,
      },

      extractedText,
      textLength: extractedText.length,
    });
  } catch (error) {
    console.error("Resume processing error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process resume.",
      },
      { status: 500 }
    );
  }
}
