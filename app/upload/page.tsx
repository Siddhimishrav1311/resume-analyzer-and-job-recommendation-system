"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setError("");
      setIsUploading(true);

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

      sessionStorage.setItem(
        "resumeAnalysis",
        JSON.stringify({
          file: result.file,
          extractedText: result.extractedText,
          textLength: result.textLength,
        })
      );

      router.push("/analyze");
    } catch (err) {
      setIsUploading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading."
      );
    }
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#0b0d0c] text-[#f4f3ed]">
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[950px] -translate-x-1/2 rounded-full bg-[#315c4a]/20 blur-[150px]" />

        <div className="absolute left-[8%] top-[30%] h-px w-px bg-white/40 shadow-[150px_80px_0_rgba(255,255,255,0.22),340px_-40px_0_rgba(255,255,255,0.18),600px_120px_0_rgba(255,255,255,0.2),850px_-70px_0_rgba(255,255,255,0.16)]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <header className="relative z-20 px-5 pt-5 sm:px-8">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between">
          {/* Logo */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-[20px] font-semibold tracking-[-0.05em] text-[#f4f3ed]"
          >
            CareerMatch
          </button>

          {/* Center navigation */}

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-white/10 bg-white/[0.045] p-1 backdrop-blur-xl md:flex">
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="rounded-full px-5 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
            >
              Job roles
            </button>

            <button
              type="button"
              onClick={() => router.push("/candidates")}
              className="rounded-full px-5 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
            >
              Candidates
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-full px-5 py-2.5 text-sm text-white/60 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
            >
              Dashboard
            </button>
          </nav>

          {/* Back button */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-white/65 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.1] hover:text-white"
          >
            Back to home
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN UPLOAD AREA
      ========================================================= */}

      <section className="relative z-10 px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <div className="mx-auto max-w-[900px]">
          {/* Heading */}

          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/60 backdrop-blur-xl">
              <span className="mr-2 text-[#9fc4b0]">
                ✦
              </span>
              Resume analysis
            </div>

            <h1 className="mx-auto mt-8 max-w-[780px] text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
              Start with your
              <span className="block font-serif font-normal italic text-[#a9c6b5]">
                resume.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[600px] text-base leading-7 text-white/45 sm:text-lg">
              Upload your resume and CareerMatch will extract the information
              needed for analysis and job-role suitability scoring.
            </p>
          </div>

          {/* =====================================================
              UPLOAD CARD
          ===================================================== */}

          <div className="mx-auto mt-14 max-w-[760px]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-2 shadow-2xl shadow-black/25 backdrop-blur-2xl">
              <div className="rounded-[24px] border border-white/[0.08] bg-[#111412]/95 p-6 sm:p-8">
                {!selectedFile ? (
                  <>
                    {/* Upload zone */}

                    <label
                      htmlFor="resume-upload"
                      className="group block cursor-pointer rounded-[20px] border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center transition-all duration-200 hover:border-[#7da58f]/60 hover:bg-white/[0.04] sm:px-10 sm:py-20"
                    >
                      {/* Upload icon */}

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-[#a9c6b5] transition-transform duration-200 group-hover:-translate-y-1">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-7 w-7"
                          aria-hidden="true"
                        >
                          <path d="M12 16V4" />
                          <path d="m7 9 5-5 5 5" />
                          <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
                        </svg>
                      </div>

                      <p className="mt-6 text-base font-medium text-white/85">
                        Choose your resume
                      </p>

                      <p className="mt-2 text-sm text-white/40">
                        PDF, DOC, or DOCX
                      </p>

                      <span className="mt-7 inline-flex rounded-full bg-[#e9e5d8] px-6 py-3 text-sm font-semibold text-[#151714] transition-transform duration-200 group-hover:-translate-y-0.5">
                        Choose resume
                      </span>

                      <p className="mt-6 text-xs text-white/25">
                        Maximum file size: 5 MB
                      </p>

                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  /* =================================================
                     SELECTED FILE
                  ================================================= */

                  <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        {/* File icon */}

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-[#a9c6b5]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-6 w-6"
                            aria-hidden="true"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                            <path d="M8 13h8" />
                            <path d="M8 17h5" />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/85">
                            {selectedFile.name}
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            {(selectedFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>

                      {/* Remove */}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setError("");
                        }}
                        disabled={isUploading}
                        className="self-start rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/45 transition-colors hover:border-white/20 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Divider */}

                    <div className="my-7 h-px bg-white/[0.07]" />

                    {/* Upload action */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/75">
                          Ready for analysis
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/30">
                          Your resume will be extracted and analyzed
                          automatically.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="rounded-full bg-[#e9e5d8] px-6 py-3.5 text-sm font-semibold text-[#151714] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {isUploading
                          ? "Analyzing..."
                          : "Upload & analyze"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error */}

                {error && (
                  <div className="mt-4 rounded-xl border border-[#6f302c] bg-[#321d1b] px-4 py-3 text-sm text-[#f0a39c]">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              SUPPORTED FORMATS
          ===================================================== */}

          <div className="mx-auto mt-8 flex max-w-[760px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-white/30">
              Supported formats
            </p>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/45">
                PDF
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/45">
                DOC
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/45">
                DOCX
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/45">
                5 MB max
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT HAPPENS NEXT
      ========================================================= */}

      <section className="relative z-10 border-t border-white/[0.08] bg-[#0d0f0e] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
                After upload
              </p>

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">
                Your resume goes straight into
                <span className="font-serif font-normal italic text-[#a9c6b5]">
                  {" "}
                  analysis.
                </span>
              </h2>
            </div>

            <div className="divide-y divide-white/[0.08]">
              <div className="flex gap-5 py-5 first:pt-0">
                <span className="text-xs text-white/25">
                  01
                </span>

                <div>
                  <h3 className="text-sm font-medium text-white/80">
                    Resume extraction
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    Text and relevant information are extracted from your
                    uploaded document.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 py-5">
                <span className="text-xs text-white/25">
                  02
                </span>

                <div>
                  <h3 className="text-sm font-medium text-white/80">
                    Resume analysis
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    CareerMatch analyzes the extracted resume information.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 py-5 last:pb-0">
                <span className="text-xs text-white/25">
                  03
                </span>

                <div>
                  <h3 className="text-sm font-medium text-white/80">
                    Job-role suitability
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    A trained ML model evaluates your resume across supported
                    job roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="relative z-10 border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold text-white/75">
              CareerMatch
            </p>

            <p className="mt-1 text-xs text-white/30">
              Resume analysis and candidate search.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/35">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="transition-colors hover:text-white"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => router.push("/candidates")}
              className="transition-colors hover:text-white"
            >
              Candidates
            </button>

            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="transition-colors hover:text-white"
            >
              Job roles
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="transition-colors hover:text-white"
            >
              Dashboard
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}