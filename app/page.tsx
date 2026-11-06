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

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (![".pdf", ".docx"].includes(extension)) {
      setError("Please upload a PDF or DOCX resume.");
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
    if (file) handleFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
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

      if (!result.analysis) {
        throw new Error("Resume analysis was not returned by the backend.");
      }

      sessionStorage.setItem(
        "resumeAnalysis",
        JSON.stringify({
          file: result.file,
          extractedText: result.extractedText,
          textLength: result.textLength,
          analysis: result.analysis,
        })
      );

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="cm-home relative min-h-screen overflow-hidden text-[#17201f]">
      <div className="cm-background absolute inset-0" />

      <section className="relative mx-auto grid min-h-screen max-w-[1580px] items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-16 xl:px-20">
        <div className="relative z-10 mx-auto w-full max-w-[760px]">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Resume Analyzer
          </div>

          <h1 className="max-w-[760px] text-5xl font-bold leading-[1.12] tracking-[-0.055em] text-[#17201f] sm:text-6xl xl:text-[68px]">
            Is your resume
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 bg-clip-text text-transparent">
              good enough?
            </span>
          </h1>

          <p className="mt-7 max-w-[690px] text-base leading-8 text-[#485653] sm:text-lg">
            Analyze your resume, understand its strengths, identify missing
            skills and evaluate its ATS readiness with CareerMatch.
          </p>

          <div
            className={`mt-10 rounded-2xl border border-dashed p-7 text-center shadow-[0_18px_60px_rgba(55,105,100,0.08)] backdrop-blur-xl transition-all duration-300 sm:p-9 ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/90"
                : "border-emerald-400/90 bg-white/65 hover:border-violet-400 hover:bg-white/80"
            }`}
          >
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-violet-100 text-emerald-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-7 w-7"
                >
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2" strokeLinecap="round" />
                </svg>
              </div>

              <span className="text-lg font-medium text-[#293632]">
                {selectedFile
                  ? selectedFile.name
                  : "Drop your resume here or choose a file"}
              </span>

              <span className="mt-2 text-sm text-[#71817b]">
                PDF & DOCX only · Maximum file size 5 MB
              </span>

              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleInputChange}
                className="sr-only"
              />
            </label>

            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="mt-3 text-sm font-medium text-violet-700 hover:text-violet-900"
              >
                Remove selected file
              </button>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Analyzing your resume..."
                : "Upload Your Resume"}
            </button>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#63716d] sm:text-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
              </svg>
              Your resume is processed securely.
            </div>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[700px] lg:block">
          <div className="absolute -inset-8 rounded-[42px] bg-gradient-to-br from-emerald-200/60 via-white/30 to-violet-300/60 blur-2xl" />

          <div className="relative rotate-[1deg] rounded-[28px] border border-white/90 bg-white/80 p-5 shadow-[0_30px_90px_rgba(64,75,115,0.18)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
                  C
                </div>
                <span className="font-semibold tracking-tight text-slate-800">
                  CareerMatch
                </span>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                RESUME INSIGHTS
              </span>
            </div>

            <div className="mt-5 grid grid-cols-[145px_1fr] gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-center text-xs font-semibold text-slate-600">
                  Resume Score
                </p>
                <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border-[9px] border-emerald-400 border-b-slate-100">
                  <span className="text-xl font-bold text-emerald-600">
                    92
                  </span>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Illustrative preview
                </p>
                <div className="mt-5 space-y-3">
                  {["Content", "Skills", "Experience", "Formatting"].map(
                    (item, index) => (
                      <div key={item}>
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>{item}</span>
                          <span>{[90, 84, 76, 88][index]}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{ width: `${[90, 84, 76, 88][index]}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-[#edf1fb] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide text-slate-700">
                      ATS CONTENT ANALYSIS
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[9px] text-slate-500">
                      PREVIEW
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-[10px] font-semibold text-slate-600">
                      KEYWORD COMPATIBILITY
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 rounded-full bg-slate-100" />
                      <div className="h-2 w-[88%] rounded-full bg-slate-100" />
                      <div className="h-2 w-[72%] rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                      <div className="h-2 rounded-full bg-slate-200" />
                      <div className="mt-3 h-2 w-[90%] rounded-full bg-slate-200" />
                      <div className="mt-3 h-2 w-[76%] rounded-full bg-slate-200" />
                      <div className="mt-3 h-2 w-[84%] rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400">SKILLS IDENTIFIED</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">24</p>
                    <div className="mt-2 h-1.5 rounded-full bg-emerald-100">
                      <div className="h-1.5 w-4/5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] text-slate-400">ATS READINESS</p>
                    <p className="mt-2 text-2xl font-bold text-violet-600">Good</p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Example interface preview
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-600">
                  RESUME ANALYSIS OVERVIEW
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="h-2 rounded-full bg-emerald-100" />
                <div className="h-2 rounded-full bg-violet-100" />
                <div className="h-2 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-7 -left-8 rounded-2xl border border-white bg-white/90 px-5 py-4 shadow-xl backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              CareerMatch
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Resume intelligence
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

