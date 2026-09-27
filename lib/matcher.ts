export const SKILLS = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Azure",
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Data Science",
  "Data Analysis",
  "Data Visualization",
  "Power BI",
  "Tableau",
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "PyTorch",
  "NLP",
  "Natural Language Processing",
  "Excel",
  "Apache Spark",
  "PySpark",
  "REST API",
  "API",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Project Management",
];

export function extractSkills(resumeText: string): string[] {
  const text = resumeText.toLowerCase();

  return SKILLS.filter((skill) =>
    text.includes(skill.toLowerCase())
  );
}

export function findMissingSkills(
  resumeText: string
): string[] {
  const detectedSkills = extractSkills(resumeText);

  const commonSkills = [
    "Python",
    "SQL",
    "Git",
    "GitHub",
    "JavaScript",
    "React",
    "Data Analysis",
    "Machine Learning",
    "Communication",
    "Problem Solving",
  ];

  return commonSkills.filter(
    (skill) => !detectedSkills.includes(skill)
  );
}