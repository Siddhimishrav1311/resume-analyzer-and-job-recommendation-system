// lib/structureResume.ts

export type StructuredResume = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  experienceLevel?: "INTERN" | "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";

  skills: {
    name: string;
    category?: string;
  }[];

  education: {
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    description?: string;
  }[];

  experience: {
    company?: string;
    role?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    technologies: string[];
  }[];

  projects: {
    name?: string;
    description?: string;
    technologies: string[];
    url?: string;
    role?: string;
  }[];

  certifications: {
    name?: string;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
  }[];

  achievements: {
    title?: string;
    description?: string;
    date?: string;
  }[];
};

const SKILLS = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "SQL",
  "HTML",
  "CSS",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Git",
  "GitHub",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "NLP",
  "Natural Language Processing",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "Power BI",
  "Tableau",
  "Excel",
  "Spark",
  "PySpark",
  "R",
  "Linux",
];

function unique(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function findSection(text: string, headings: string[]) {
  const lines = text.split("\n");

  const headingIndex = lines.findIndex((line) => {
    const normalized = line
      .trim()
      .toLowerCase()
      .replace(/[^a-z ]/g, "");

    return headings.some((heading) => normalized === heading);
  });

  if (headingIndex === -1) return "";

  const sectionHeadings = [
    "education",
    "experience",
    "work experience",
    "employment",
    "skills",
    "technical skills",
    "projects",
    "certifications",
    "certificates",
    "achievements",
    "awards",
    "summary",
    "profile",
    "objective",
  ];

  const remaining = lines.slice(headingIndex + 1);

  const endIndex = remaining.findIndex((line) => {
    const normalized = line
      .trim()
      .toLowerCase()
      .replace(/[^a-z ]/g, "");

    return (
      sectionHeadings.includes(normalized) &&
      !headings.includes(normalized)
    );
  });

  return (endIndex === -1
    ? remaining
    : remaining.slice(0, endIndex)
  )
    .join("\n")
    .trim();
}

function extractName(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 8)) {
    if (
      line.length >= 3 &&
      line.length <= 60 &&
      !line.includes("@") &&
      !/\d{5,}/.test(line) &&
      !/resume|curriculum vitae|cv/i.test(line) &&
      /^[A-Za-z .'-]+$/.test(line)
    ) {
      return line;
    }
  }

  return undefined;
}

function extractEmail(text: string) {
  return text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  )?.[0];
}

function extractPhone(text: string) {
  return text.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}/
  )?.[0];
}

function extractLinks(text: string) {
  const urls = text.match(
    /https?:\/\/[^\s)]+/gi
  ) || [];

  return {
    linkedin: urls.find((url) =>
      /linkedin\.com/i.test(url)
    ),
    github: urls.find((url) =>
      /github\.com/i.test(url)
    ),
    portfolio: urls.find(
      (url) =>
        !/linkedin\.com|github\.com/i.test(url)
    ),
  };
}

function extractSkills(text: string) {
  const lowerText = text.toLowerCase();

  return unique(
    SKILLS.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    )
  ).map((name) => ({
    name,
    category:
      /python|java|javascript|typescript|c\+\+|c\b|r\b/i.test(
        name
      )
        ? "Programming Language"
        : /react|next|node|express|html|css/i.test(name)
        ? "Web Development"
        : /sql|mysql|postgresql|mongodb|spark|pyspark/i.test(
            name
          )
        ? "Database & Data"
        : /aws|azure|gcp|docker|kubernetes|linux/i.test(name)
        ? "Cloud & DevOps"
        : /machine learning|deep learning|artificial intelligence|nlp|tensorflow|pytorch|scikit/i.test(
            name
          )
        ? "AI & Machine Learning"
        : /pandas|numpy|power bi|tableau|excel/i.test(name)
        ? "Data & Analytics"
        : "Technical Skill",
  }));
}

function detectExperienceLevel(text: string) {
  const lower = text.toLowerCase();

  if (/lead|principal|director/i.test(lower)) return "LEAD" as const;
  if (/senior|sr\./i.test(lower)) return "SENIOR" as const;
  if (/mid[- ]level/i.test(lower)) return "MID" as const;
  if (/junior|jr\./i.test(lower)) return "JUNIOR" as const;
  if (/intern|internship|trainee/i.test(lower)) return "INTERN" as const;

  return "ENTRY" as const;
}

function parseEducation(section: string) {
  if (!section) return [];

  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(0, 10).map((line) => ({
    institution: line,
    description: undefined,
  }));
}

function parseProjects(section: string) {
  if (!section) return [];

  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) => line.length > 3)
    .slice(0, 20)
    .map((line) => ({
      name: line,
      technologies: [],
    }));
}

function parseExperience(section: string, text: string) {
  if (!section) return [];

  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const skills = extractSkills(text).map((skill) => skill.name);

  return lines
    .filter((line) => line.length > 3)
    .slice(0, 20)
    .map((line) => ({
      role: line,
      technologies: skills.slice(0, 10),
    }));
}

function parseCertifications(section: string) {
  if (!section) return [];

  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((line) => ({
      name: line,
    }));
}

function parseAchievements(section: string) {
  if (!section) return [];

  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((line) => ({
      title: line,
    }));
}

export function structureResume(text: string): StructuredResume {
  const links = extractLinks(text);

  const skillsSection = findSection(text, [
    "skills",
    "technical skills",
  ]);

  const educationSection = findSection(text, [
    "education",
  ]);

  const experienceSection = findSection(text, [
    "experience",
    "work experience",
    "employment",
  ]);

  const projectsSection = findSection(text, [
    "projects",
  ]);

  const certificationSection = findSection(text, [
    "certifications",
    "certificates",
  ]);

  const achievementSection = findSection(text, [
    "achievements",
    "awards",
  ]);

  const skills = extractSkills(
    `${skillsSection}\n${text}`
  );

  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),

    linkedin: links.linkedin,
    github: links.github,
    portfolio: links.portfolio,

    summary: undefined,

    experienceLevel: detectExperienceLevel(text),

    skills,

    education: parseEducation(
      educationSection
    ),

    experience: parseExperience(
      experienceSection,
      text
    ),

    projects: parseProjects(
      projectsSection
    ),

    certifications: parseCertifications(
      certificationSection
    ),

    achievements: parseAchievements(
      achievementSection
    ),
  };
}