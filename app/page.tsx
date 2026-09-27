"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    setError("");

    const validExtensions = [".pdf", ".doc", ".docx"];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(extension)) {
      setError("Please upload a PDF, DOC or DOCX resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume size should be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("resume", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      console.log("Resume uploaded successfully.");
      console.log("Extracted text:", result.extractedText);

      sessionStorage.setItem(
        "resumeAnalysis",
        JSON.stringify({
          file: result.file,
          extractedText: result.extractedText,
          textLength: result.textLength,
        })
      );

      router.push("/analyze");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the resume."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#171717]">
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-[19px] font-semibold tracking-[-0.02em]"
          >
            CareerMatch
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-[#737373] hover:text-[#171717]"
          >
          </button>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[720px]">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
              Resume Analyzer
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Upload your resume
            </h1>

            <p className="mx-auto mt-5 max-w-[560px] text-base leading-7 text-[#737373]">
              Upload your resume and let CareerMatch analyze your skills,
              experience and profile.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-[#dedbd8] bg-white p-3">
            <div className="rounded-xl border border-[#e5e2df] p-7 sm:p-10">
              {!selectedFile ? (
                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-16 text-center transition-all ${
                    isDragging
                      ? "border-[#171717] bg-[#f5f5f4]"
                      : "border-[#d6d3d1] bg-[#fcfcfb] hover:border-[#a8a29e]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className="hidden"
                  />

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f0ee]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-7 w-7 text-[#404040]"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                    </svg>
                  </div>

                  <p className="mt-5 text-sm font-medium">
                    Drop your resume here
                  </p>

                  <p className="mt-2 text-sm text-[#8a8a8a]">
                    or browse files from your device
                  </p>

                  <p className="mt-5 text-xs text-[#a3a3a3]">
                    PDF · DOC · DOCX · Maximum 5 MB
                  </p>
                </label>
              ) : (
                <div className="rounded-xl border border-[#dedbd8] bg-[#fafaf9] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-[#737373]">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="shrink-0 text-xs font-medium text-[#737373] hover:text-[#171717]"
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-5 flex w-full items-center justify-center rounded-lg bg-[#171717] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2f2f2f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading
                      ? "Analyzing resume..."
                      : "Upload & Analyze Resume"}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e5e2df] bg-white p-5">
              <p className="text-sm font-semibold">01</p>
              <p className="mt-2 text-sm font-medium">Resume parsing</p>
              <p className="mt-1 text-xs leading-5 text-[#737373]">
                We extract the text from your resume.
              </p>
            </div>

            <div className="rounded-xl border border-[#e5e2df] bg-white p-5">
              <p className="text-sm font-semibold">02</p>
              <p className="mt-2 text-sm font-medium">NLP analysis</p>
              <p className="mt-1 text-xs leading-5 text-[#737373]">
                Skills and important information are identified.
              </p>
            </div>

            <div className="rounded-xl border border-[#e5e2df] bg-white p-5">
              <p className="text-sm font-semibold">03</p>
              <p className="mt-2 text-sm font-medium">ATS score</p>
              <p className="mt-1 text-xs leading-5 text-[#737373]">
                Your resume receives an ATS analysis.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}