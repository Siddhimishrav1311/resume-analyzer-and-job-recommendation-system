export type ResumeSections = {
  summary: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  certifications: string;
  other: string;
};

type SectionName =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications";

const SECTION_ALIASES: Record<SectionName, string[]> = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "objective",
    "career objective",
  ],

  skills: [
    "skills",
    "technical skills",
    "core skills",
    "key skills",
    "technical competencies",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "internship",
    "internships",
  ],

  education: [
    "education",
    "academic background",
    "educational background",
    "qualifications",
  ],

  projects: [
    "projects",
    "academic projects",
    "personal projects",
    "key projects",
  ],

  certifications: [
    "certifications",
    "certificates",
    "licenses & certifications",
    "courses",
    "training",
  ],
};

function normalizeHeading(line: string): string {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9&\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSection(line: string): SectionName | null {
  const normalizedLine = normalizeHeading(line);

  if (!normalizedLine) {
    return null;
  }

  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(normalizedLine)) {
      return section as SectionName;
    }
  }

  return null;
}

export function extractResumeSections(resumeText: string): ResumeSections {
  const lines = resumeText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  const sections: ResumeSections = {
    summary: "",
    skills: "",
    experience: "",
    education: "",
    projects: "",
    certifications: "",
    other: "",
  };

  let currentSection: SectionName | "other" = "other";

  for (const line of lines) {
    const detectedSection = detectSection(line);

    if (detectedSection) {
      currentSection = detectedSection;
      continue;
    }

    const cleanedLine = line.trim();

    if (!cleanedLine) {
      continue;
    }

    sections[currentSection] +=
      (sections[currentSection] ? "\n" : "") + cleanedLine;
  }

  return sections;
}
