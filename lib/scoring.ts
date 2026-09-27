export type ResumeScore = {
  score: number;
  sectionsFound: string[];
  sectionsMissing: string[];
  wordCount: number;
};

const REQUIRED_SECTIONS = [
  "education",
  "experience",
  "skills",
  "projects",
];

const OPTIONAL_SECTIONS = [
  "certification",
  "certifications",
  "summary",
  "objective",
];

export function calculateResumeScore(
  resumeText: string
): ResumeScore {
  const text = resumeText.toLowerCase();

  const sectionsFound = REQUIRED_SECTIONS.filter((section) =>
    text.includes(section)
  );

  const sectionsMissing = REQUIRED_SECTIONS.filter(
    (section) => !text.includes(section)
  );

  const optionalFound = OPTIONAL_SECTIONS.filter((section) =>
    text.includes(section)
  );

  const words = resumeText
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const wordCount = words.length;

  const sectionScore =
    (sectionsFound.length / REQUIRED_SECTIONS.length) * 60;

  const optionalScore =
    Math.min(optionalFound.length, 2) * 10;

  let lengthScore = 0;

  if (wordCount >= 300 && wordCount <= 1000) {
    lengthScore = 20;
  } else if (wordCount >= 150) {
    lengthScore = 10;
  }

  const score = Math.min(
    100,
    Math.round(sectionScore + optionalScore + lengthScore)
  );

  return {
    score,
    sectionsFound,
    sectionsMissing,
    wordCount,
  };
}