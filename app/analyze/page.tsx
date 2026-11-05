
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRoleSuitability } from "@/app/actions/roleSuitability";

type ResumeData = {
  file?: {
    originalName: string;
    savedName: string;
    size: number;
    type: string;
  };
  extractedText?: string;
  textLength?: number;
};

type RoleResult = {
  id: string;
  title: string;
  score: number;
};

type AnalysisData = {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  missingSkills: string[];
};

const SKILL_LIBRARY = [
  "Python",
  "SQL",
  "Java",
  "JavaScript",
  "TypeScript",
  "C++",
  "C",
  "React",
  "Next.js",
  "Node.js",
  "HTML",
  "CSS",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "PyTorch",
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Data Analysis",
  "Data Visualization",
  "Power BI",
  "Tableau",
  "Excel",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Spark",
  "Hadoop",
  "Linux",
];

const ROLE_SKILLS: Record<string, string[]> = {
  "Data Analyst": [
    "Python",
    "SQL",
    "Excel",
    "Pandas",
    "Data Analysis",
    "Data Visualization",
    "Power BI",
    "Tableau",
  ],
  "Data Scientist": [
    "Python",
    "SQL",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Machine Learning",
    "Data Analysis",
  ],
  "Data Engineer": [
    "Python",
    "SQL",
    "Spark",
    "Hadoop",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Azure",
  ],
  "Business Analyst": [
    "SQL",
    "Excel",
    "Power BI",
    "Tableau",
    "Data Analysis",
  ],
  "Machine Learning Engineer": [
    "Python",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "Docker",
  ],
  "Software Engineer": [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Git",
  ],
  "Cloud Engineer": [
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Linux",
    "Python",
  ],
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function extractSkills(text: string) {
  const lower = text.toLowerCase();

  return SKILL_LIBRARY.filter((skill) =>
    lower.includes(skill.toLowerCase())
  );
}

function extractSection(text: string, headings: string[]) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: string[] = [];

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedHeadings = headings.map(normalize);

  const allSectionHeadings = [
    "education",
    "experience",
    "work experience",
    "professional experience",
    "projects",
    "project",
    "certifications",
    "certification",
    "achievements",
    "skills",
    "technical skills",
    "summary",
    "profile",
  ].map(normalize);

  let collecting = false;

  for (const line of lines) {
    const normalized = normalize(line);

    if (normalizedHeadings.includes(normalized)) {
      collecting = true;
      continue;
    }

    if (
      collecting &&
      allSectionHeadings.includes(normalized) &&
      !normalizedHeadings.includes(normalized)
    ) {
      break;
    }

    if (collecting) {
      result.push(line);
    }
  }

  return result.slice(0, 8);
}

function calculateATSScore(
  text: string,
  skills: string[],
  sections: AnalysisData
) {
  if (!text.trim()) return 0;

  let score = 0;

  const wordCount = text.trim().split(/\s+/).length;

  if (wordCount >= 150) score += 15;
  else if (wordCount >= 100) score += 12;
  else if (wordCount >= 50) score += 8;

  score += Math.min(skills.length * 2, 24);

  if (sections.experience.length > 0) score += 12;
  if (sections.education.length > 0) score += 12;
  if (sections.projects.length > 0) score += 10;
  if (sections.certifications.length > 0) score += 6;

  if (
    /\b(email|e-mail)\b/i.test(text) &&
    /@/.test(text)
  ) {
    score += 5;
  }

  if (/\b(phone|mobile|contact)\b/i.test(text)) {
    score += 4;
  }

  if (/\blinkedin\b/i.test(text)) {
    score += 3;
  }

  if (/\bgithub\b/i.test(text)) {
    score += 3;
  }

  return Math.min(Math.round(score), 100);
}

function getMissingSkills(
  roleResults: RoleResult[],
  skills: string[]
) {
  const bestRole = roleResults[0];

  if (!bestRole) return [];

  const required = ROLE_SKILLS[bestRole.title] || [];

  return required.filter(
    (skill) =>
      !skills.some(
        (existing) =>
          existing.toLowerCase() === skill.toLowerCase()
      )
  );
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  return "Developing";
}

function AnimatedScore({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1000;

    const animate = (time: number) => {
      const progress = Math.min(
        (time - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayScore(
        Math.round(score * eased)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <span
      className={
        large
          ? "text-7xl font-semibold tracking-[-0.07em]"
          : "text-6xl font-semibold tracking-[-0.06em]"
      }
    >
      {displayScore}
    </span>
  );
}

function ExpandableSection({
  title,
  data,
}: {
  title: string;
  data: string[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-[26px] border border-white/10 bg-[#111412]"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-7 py-6 text-left transition hover:bg-white/[0.025] sm:px-9"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
            {title}
          </p>

          <p className="mt-2 text-sm text-white/35">
            {data.length > 0
              ? `${data.length} ${data.length === 1 ? "entry" : "entries"} detected`
              : `No structured ${title.toLowerCase()} detected`}
          </p>
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-white/40"
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="border-t border-white/[0.08] p-7 sm:p-9">
              {data.length > 0 ? (
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <motion.div
                      key={`${title}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6 text-white/60">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/30">
                  No clearly structured{" "}
                  {title.toLowerCase()} section was detected.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  const [roleResults, setRoleResults] = useState<RoleResult[]>(
    []
  );

  const [analysis, setAnalysis] =
    useState<AnalysisData | null>(null);

  const [atsScore, setAtsScore] = useState(0);

  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedResume =
      sessionStorage.getItem("resumeAnalysis");

    if (!storedResume) {
      router.replace("/upload");
      return;
    }

    try {
      const data = JSON.parse(storedResume);

      setResume(data);
      setLoading(false);
    } catch (error) {
      console.error(
        "Failed to read resume data:",
        error
      );

      router.replace("/upload");
    }
  }, [router]);

  useEffect(() => {
    if (!resume?.extractedText?.trim()) return;

    async function analyzeResume() {
      const text = resume?.extractedText || "";

      setCalculating(true);
      setError("");

      const skills = extractSkills(text);

      const parsedAnalysis: AnalysisData = {
        skills,

        experience: extractSection(text, [
          "experience",
          "work experience",
          "professional experience",
        ]),

        education: extractSection(text, [
          "education",
        ]),

        projects: extractSection(text, [
          "projects",
          "project",
        ]),

        certifications: extractSection(text, [
          "certifications",
          "certification",
        ]),

        missingSkills: [],
      };

      const score = calculateATSScore(
        text,
        skills,
        parsedAnalysis
      );

      setAnalysis(parsedAnalysis);
      setAtsScore(score);

      try {
        const result = await calculateRoleSuitability(text);

        setRoleResults(result.results);

        parsedAnalysis.missingSkills =
          getMissingSkills(
            result.results,
            skills
          );

        setAnalysis({
          ...parsedAnalysis,
          missingSkills:
            parsedAnalysis.missingSkills,
        });
      } catch (error) {
        console.error(
          "Automatic role analysis failed:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to analyze resume."
        );
      } finally {
        setCalculating(false);
      }
    }

    analyzeResume();
  }, [resume]);

  if (!mounted) return null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d0c] text-[#f4f3ed]">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="mx-auto mb-5 h-10 w-10 rounded-full border-2 border-white/10 border-t-[#a9c6b5]"
          />

          <p className="text-sm text-white/60">
            Preparing your resume analysis...
          </p>
        </div>
      </main>
    );
  }

  if (!resume) return null;

  const text = resume.extractedText || "";
  const bestRole = roleResults[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b0d0c] text-[#f4f3ed]">
      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.75, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-300px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-[#315c4a]/15 blur-[150px]"
        />

        <div className="absolute inset-0 opacity-[0.02] [background-image:radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      {/* NAV */}

      <header className="relative z-10 border-b border-white/[0.08] px-5 sm:px-8">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between">
          <motion.button
            type="button"
            onClick={() => router.push("/")}
            whileHover={{ x: 2 }}
            className="text-[20px] font-semibold tracking-[-0.05em]"
          >
            CareerMatch
          </motion.button>

          <motion.button
            type="button"
            onClick={() => router.push("/upload")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium transition hover:bg-white/[0.1]"
          >
            Analyze another resume
          </motion.button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16">
        {/* HEADER */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-[800px]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
            Resume intelligence
          </p>

          <h1 className="mt-5 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
            Your resume,
            <span className="font-serif font-normal italic text-[#a9c6b5]">
              {" "}
              analyzed.
            </span>
          </h1>

          <p className="mt-5 max-w-[650px] text-base leading-7 text-white/45">
            CareerMatch has analyzed your uploaded resume
            for ATS readiness, resume structure, skills,
            and suitability across supported job roles.
          </p>
        </motion.div>

        {/* RESUME SUMMARY */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.08 }}
          className="mt-12 grid gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 md:grid-cols-[1.4fr_0.6fr]"
        >
          <div className="bg-[#111412] p-7 sm:p-9">
            <p className="text-xs uppercase tracking-[0.14em] text-white/30">
              Resume
            </p>

            <h2 className="mt-4 break-words text-2xl font-semibold tracking-[-0.04em]">
              {resume.file?.originalName ||
                "Uploaded Resume"}
            </h2>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/40">
              <span>
                {Math.round(
                  (resume.file?.size || 0) / 1024
                )}{" "}
                KB
              </span>

              <span>
                {resume.textLength || text.length}{" "}
                characters
              </span>

              <span>
                {text.trim()
                  ? text.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </span>
            </div>
          </div>

          <motion.div
            whileHover={{
              backgroundColor: "#181b19",
            }}
            className="bg-[#151816] p-7 transition-colors sm:p-9"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-white/30">
              ATS score
            </p>

            <div className="mt-4 flex items-end gap-2">
              {calculating ? (
                <span className="text-6xl font-semibold tracking-[-0.06em]">
                  ...
                </span>
              ) : (
                <AnimatedScore score={atsScore} />
              )}

              <span className="mb-2 text-white/30">
                / 100
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Resume structure and searchable content
              analysis.
            </p>
          </motion.div>
        </motion.section>

        {/* ATS + OVERVIEW */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.16 }}
          className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[26px] border border-white/10 bg-[#111412] p-7 transition-colors hover:border-white/15 sm:p-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
              ATS readiness
            </p>

            <div className="mt-8">
              {calculating ? (
                <span className="text-7xl font-semibold tracking-[-0.07em]">
                  ...
                </span>
              ) : (
                <AnimatedScore
                  score={atsScore}
                  large
                />
              )}

              <span className="ml-2 text-lg text-white/30">
                / 100
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{
                opacity: calculating ? 0 : 1,
              }}
              transition={{ delay: 1 }}
              className="mt-4 text-sm font-medium text-[#a9c6b5]"
            >
              {getScoreLabel(atsScore)}
            </motion.p>

            <p className="mt-3 text-sm leading-6 text-white/45">
              This score is calculated from the extracted
              resume content, structure, searchable skills,
              and key resume sections.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[26px] border border-white/10 bg-[#111412] p-7 transition-colors hover:border-white/15 sm:p-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
              Resume overview
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                [
                  analysis?.skills.length || 0,
                  "Skills detected",
                ],
                [
                  analysis?.projects.length || 0,
                  "Project entries",
                ],
                [
                  analysis?.experience.length || 0,
                  "Experience entries",
                ],
                [
                  analysis?.education.length || 0,
                  "Education entries",
                ],
              ].map(([value, label], index) => (
                <motion.div
                  key={label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.35 + index * 0.08,
                  }}
                >
                  <p className="text-3xl font-semibold">
                    {value}
                  </p>

                  <p className="mt-1 text-sm text-white/35">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ROLE SUITABILITY */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.24 }}
          className="mt-8 rounded-[26px] border border-white/10 bg-[#111412] p-7 sm:p-9"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
                Job suitability
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Where your profile fits
              </h2>

              <p className="mt-2 max-w-[650px] text-sm leading-6 text-white/40">
                Scores generated by your trained CareerMatch
                machine learning model across supported job
                roles.
              </p>
            </div>

            {bestRole && !calculating && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: 12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="text-left sm:text-right"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                  Highest match
                </p>

                <p className="mt-1 text-lg font-semibold text-[#a9c6b5]">
                  {bestRole.title}
                </p>
              </motion.div>
            )}
          </div>

          {calculating && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center"
            >
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="mx-auto mb-5 h-9 w-9 rounded-full border-2 border-white/10 border-t-[#a9c6b5]"
              />

              <p className="text-sm font-medium">
                Running your resume through the matching
                model...
              </p>

              <p className="mt-2 text-xs text-white/30">
                Comparing your profile against supported
                career roles
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200"
            >
              {error}
            </motion.div>
          )}

          {!calculating && roleResults.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              className="mt-8 divide-y divide-white/[0.07]"
            >
              {roleResults.map((role, index) => (
                <motion.div
                  key={role.id}
                  variants={itemVariants}
                  custom={index}
                  transition={{
                    delay: index * 0.07,
                  }}
                  whileHover={{
                    x: 5,
                  }}
                  className="flex items-center justify-between gap-5 py-5 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-6 text-xs text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className="font-medium text-white/85">
                        {role.title}
                      </h3>

                      <p className="mt-1 text-xs text-white/30">
                        Resume-to-role suitability
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <motion.span
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.4 + index * 0.08,
                      }}
                      className="text-2xl font-semibold"
                    >
                      {role.score}
                    </motion.span>

                    <span className="ml-1 text-sm text-white/30">
                      / 100
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* SKILLS */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.32 }}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[26px] border border-white/10 bg-[#111412] p-7 transition-colors hover:border-white/15 sm:p-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
              Skills detected
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Your technical profile
            </h2>

            <div className="mt-7 flex flex-wrap gap-2">
              {analysis?.skills.length ? (
                analysis.skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: index * 0.035,
                      duration: 0.25,
                    }}
                    whileHover={{
                      y: -2,
                      scale: 1.04,
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-sm text-white/70 transition-colors hover:border-[#9fc4b0]/30 hover:text-[#d7e7df]"
                  >
                    {skill}
                  </motion.span>
                ))
              ) : (
                <p className="text-sm text-white/35">
                  No recognized skills were detected.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-[26px] border border-white/10 bg-[#111412] p-7 transition-colors hover:border-white/15 sm:p-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
              Skill gaps
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Skills to consider
            </h2>

            <p className="mt-2 text-sm text-white/35">
              Based on the highest-ranked job role.
            </p>

            <div className="mt-7 space-y-3">
              {analysis?.missingSkills.length ? (
                analysis.missingSkills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <span className="text-sm text-white/70">
                      {skill}
                    </span>

                    <span className="text-xs text-white/25">
                      Consider adding
                    </span>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-white/35">
                  No major skill gaps detected for the
                  highest-ranked role.
                </p>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* RESUME SECTIONS */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.4 }}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <ExpandableSection
            title="Experience"
            data={analysis?.experience || []}
          />

          <ExpandableSection
            title="Education"
            data={analysis?.education || []}
          />

          <ExpandableSection
            title="Projects"
            data={analysis?.projects || []}
          />

          <ExpandableSection
            title="Certifications"
            data={analysis?.certifications || []}
          />
        </motion.section>

        {/* EXTRACTED TEXT */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.48 }}
          className="mt-8 overflow-hidden rounded-[26px] border border-white/10 bg-[#111412]"
        >
          <button
            type="button"
            onClick={() => setShowText((value) => !value)}
            className="flex w-full items-center justify-between border-b border-white/10 px-7 py-6 text-left transition hover:bg-white/[0.025] sm:px-9"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4b0]">
                Source document
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Extracted resume text
              </h2>

              <p className="mt-2 text-sm text-white/35">
                The text used for analysis.
              </p>
            </div>

            <motion.span
              animate={{
                rotate: showText ? 180 : 0,
              }}
              transition={{ duration: 0.25 }}
              className="text-white/40"
            >
              ↓
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showText && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="max-h-[500px] overflow-y-auto p-7 sm:p-9">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-white/55">
                    {text}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* BOTTOM ACTION */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.55,
          }}
          className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-8 sm:flex-row sm:justify-between"
        >
          <motion.button
            type="button"
            onClick={() => router.push("/")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            Back to CareerMatch
          </motion.button>

          <motion.button
            type="button"
            onClick={() => router.push("/upload")}
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            className="rounded-full bg-[#e9e5d8] px-6 py-3 text-sm font-semibold text-[#151714] transition"
          >
            Analyze another resume
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
