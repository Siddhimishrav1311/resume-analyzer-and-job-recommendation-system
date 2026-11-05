"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const navItems = ["Workflow", "Use Cases", "Pricing", "FAQ"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080a09] text-[#f5f3ec]">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-420px] h-[850px] w-[1100px] -translate-x-1/2 rounded-full bg-[#315c4a]/20 blur-[160px]" />

        <div className="absolute left-[8%] top-[30%] h-[420px] w-[420px] rounded-full bg-[#315c4a]/10 blur-[150px]" />

        <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#8eb8a3]/[0.05] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "97px 97px",
            backgroundPosition: "20px 30px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-xs text-[#b7d2c3] transition-all duration-300 group-hover:border-[#9fc4b0]/30 group-hover:bg-[#9fc4b0]/10">
            C
          </span>

          <span>
            Career<span className="text-[#9fc4b0]">Match</span>
          </span>
        </Link>

        {/* Center navigation */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-white/[0.08] bg-white/[0.035] p-1 backdrop-blur-xl md:flex">
          {navItems.map((item, index) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className={`rounded-full px-4 py-2 text-[11px] font-medium transition-all duration-300 ${
                index === 0
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:bg-white/[0.05] hover:text-white/80"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-xs font-medium text-white/45 transition-colors hover:text-white sm:block"
          >
            Log in
          </Link>

          <Link
            href="/analyze"
            className="group rounded-full border border-[#9fc4b0]/20 bg-[#9fc4b0]/10 px-4 py-2.5 text-[11px] font-semibold text-[#c8ddd1] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9fc4b0]/40 hover:bg-[#9fc4b0]/15 hover:shadow-[0_8px_35px_rgba(142,184,163,0.12)]"
          >
            <span className="mr-1.5 transition-transform duration-300 group-hover:rotate-12">
              ✦
            </span>
            Analyze Resume
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-7xl flex-col items-center px-5 pb-14 pt-16 text-center sm:px-8 sm:pt-24 lg:px-10 lg:pt-28">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.035] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 shadow-[0_0_40px_rgba(142,184,163,0.04)] backdrop-blur-xl"
        >
          <span className="mr-2 text-[#a9c6b5]">✦</span>
          AI-powered resume intelligence
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 max-w-5xl text-[clamp(3rem,8vw,6.8rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-white"
        >
          Know where your{" "}
          <span className="font-serif font-normal italic text-[#b9a982]">
            resume
          </span>{" "}
          fits.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.25,
          }}
          className="mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base"
        >
          CareerMatch analyzes your resume, measures your fit against real
          roles, and turns your experience into structured intelligence for
          candidates and recruiters.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.35,
          }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          {/* Primary CTA - lowered brightness */}
          <Link
            href="/upload"
            className="group inline-flex items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] px-7 py-3.5 text-xs font-medium text-white/65 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.12] hover:text-white/85 hover:shadow-[0_12px_40px_rgba(255,255,255,0.05)]"
          >
            Analyze my resume
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="#workflow"
            className="group inline-flex items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.035] px-7 py-3.5 text-xs font-medium text-white/65 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white"
          >
            <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/30 text-[7px] transition-transform duration-300 group-hover:scale-110">
              ▶
            </span>
            See how it works
          </Link>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 45, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mt-20 w-full max-w-5xl"
        >
          {/* Glow */}
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#315c4a]/15 blur-[100px]" />

          {/* Dashboard glass */}
          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#111411]/90 text-left shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
              </div>

              <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                CareerMatch
              </span>

              <span className="text-[9px] text-white/20">
                Resume intelligence
              </span>
            </div>

            {/* Preview content */}
            <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
              {/* Profile */}
              <div className="border-b border-white/[0.07] p-7 md:border-b-0 md:border-r">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8eb8a3]">
                  Candidate profile
                </p>

                <h3 className="mt-3 text-xl font-medium tracking-[-0.04em] text-white/90">
                  Resume analyzed
                </h3>

                <p className="mt-3 text-xs leading-5 text-white/30">
                  Experience, skills, education and projects have been
                  converted into structured profile data.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {["Python", "SQL", "Machine Learning", "AWS"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[9px] text-white/45"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Matching */}
              <div className="p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                      Job suitability
                    </p>

                    <h3 className="mt-2 text-xl font-medium tracking-[-0.04em] text-white/90">
                      Roles matching your profile
                    </h3>
                  </div>

                  <span className="rounded-full border border-[#8eb8a3]/15 bg-[#8eb8a3]/[0.06] px-3 py-1.5 text-[8px] uppercase tracking-wider text-[#9fc4b0]">
                    ML Match
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Data Analyst",
                    "Data Scientist",
                    "Data Engineer",
                  ].map((role, index) => (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 1 + index * 0.12,
                        duration: 0.5,
                      }}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-white/35">
                          {index + 1}
                        </span>

                        <span className="text-xs text-white/60">
                          {role}
                        </span>
                      </div>

                      <span className="text-[9px] uppercase tracking-wider text-white/25">
                        Match
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Capability strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.7,
          }}
          className="mt-14 grid w-full max-w-4xl border-y border-white/[0.07] sm:grid-cols-3"
        >
          {/* Capability 1 */}
          <div className="flex items-center justify-center gap-3 px-5 py-6 sm:border-r sm:border-white/[0.07]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#9fc4b0]">
              ✦
            </div>

            <div className="text-left">
              <p className="text-xs font-medium text-white/65">
                Resume analysis
              </p>

              <p className="mt-0.5 text-[10px] text-white/25">
                Structured automatically
              </p>
            </div>
          </div>

          {/* Capability 2 */}
          <div className="flex items-center justify-center gap-3 border-t border-white/[0.07] px-5 py-6 sm:border-t-0 sm:border-r">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#9fc4b0]">
              ↗
            </div>

            <div className="text-left">
              <p className="text-xs font-medium text-white/65">
                ML suitability
              </p>

              <p className="mt-0.5 text-[10px] text-white/25">
                Resume-to-role matching
              </p>
            </div>
          </div>

          {/* Capability 3 */}
          <div className="flex items-center justify-center gap-3 border-t border-white/[0.07] px-5 py-6 sm:border-t-0">
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border-2 border-[#080a09] bg-[#315c4a]" />
              <span className="h-7 w-7 rounded-full border-2 border-[#080a09] bg-[#8a8067]" />
              <span className="h-7 w-7 rounded-full border-2 border-[#080a09] bg-[#68766e]" />
            </div>

            <div className="text-left">
              <p className="text-xs font-medium text-white/65">
                Candidate search
              </p>

              <p className="mt-0.5 text-[10px] text-white/25">
                Built for recruiters
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Workflow section */}
      <section
        id="workflow"
        className="relative z-10 mx-auto max-w-7xl px-5 pb-28 sm:px-8 lg:px-10"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Upload",
              text: "Upload a resume and let CareerMatch extract the information that matters.",
            },
            {
              number: "02",
              title: "Understand",
              text: "Resume content is transformed into structured skills, experience and profile intelligence.",
            },
            {
              number: "03",
              title: "Match",
              text: "Measure how strongly a candidate fits a role using the trained suitability model.",
            },
          ].map((item) => (
            <motion.div
              key={item.number}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-7 backdrop-blur-xl"
            >
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[#8eb8a3]">
                {item.number}
              </span>

              <h2 className="mt-5 text-xl font-medium tracking-[-0.04em] text-white/90">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/35">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}