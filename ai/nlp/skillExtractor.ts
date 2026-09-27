export type ExtractedSkill = {
  name: string;
  category: string;
  confidence: number;
  evidence: string;
};

const SKILL_PATTERNS: {
  name: string;
  category: string;
  aliases: string[];
}[] = [
  {
    name: "Python",
    category: "Programming Language",
    aliases: ["python", "python3"],
  },
  {
    name: "Java",
    category: "Programming Language",
    aliases: ["java"],
  },
  {
    name: "JavaScript",
    category: "Programming Language",
    aliases: ["javascript", "js"],
  },
  {
    name: "TypeScript",
    category: "Programming Language",
    aliases: ["typescript", "ts"],
  },
  {
    name: "C++",
    category: "Programming Language",
    aliases: ["c++", "cpp"],
  },
  {
    name: "SQL",
    category: "Database",
    aliases: ["sql", "structured query language"],
  },
  {
    name: "HTML",
    category: "Web Development",
    aliases: ["html", "html5"],
  },
  {
    name: "CSS",
    category: "Web Development",
    aliases: ["css", "css3"],
  },
  {
    name: "React",
    category: "Web Development",
    aliases: ["react", "react.js", "reactjs"],
  },
  {
    name: "Next.js",
    category: "Web Development",
    aliases: ["next.js", "nextjs", "next js"],
  },
  {
    name: "Node.js",
    category: "Backend Development",
    aliases: ["node.js", "nodejs", "node js"],
  },
  {
    name: "Tailwind CSS",
    category: "Web Development",
    aliases: ["tailwind css", "tailwindcss"],
  },
  {
    name: "Git",
    category: "Developer Tools",
    aliases: ["git"],
  },
  {
    name: "GitHub",
    category: "Developer Tools",
    aliases: ["github", "git hub"],
  },
  {
    name: "Docker",
    category: "DevOps",
    aliases: ["docker"],
  },
  {
    name: "AWS",
    category: "Cloud",
    aliases: ["aws", "amazon web services"],
  },
  {
    name: "Azure",
    category: "Cloud",
    aliases: ["azure", "microsoft azure"],
  },
  {
    name: "Google Cloud",
    category: "Cloud",
    aliases: ["google cloud", "gcp", "google cloud platform"],
  },
  {
    name: "PostgreSQL",
    category: "Database",
    aliases: ["postgresql", "postgres"],
  },
  {
    name: "MySQL",
    category: "Database",
    aliases: ["mysql"],
  },
  {
    name: "MongoDB",
    category: "Database",
    aliases: ["mongodb", "mongo db"],
  },
  {
    name: "Pandas",
    category: "Data Science",
    aliases: ["pandas"],
  },
  {
    name: "NumPy",
    category: "Data Science",
    aliases: ["numpy", "num py"],
  },
  {
    name: "Scikit-learn",
    category: "Machine Learning",
    aliases: ["scikit-learn", "scikit learn", "sklearn"],
  },
  {
    name: "TensorFlow",
    category: "Machine Learning",
    aliases: ["tensorflow", "tensor flow"],
  },
  {
    name: "PyTorch",
    category: "Machine Learning",
    aliases: ["pytorch", "py torch"],
  },
  {
    name: "Machine Learning",
    category: "Artificial Intelligence",
    aliases: ["machine learning", "machine-learning"],
  },
  {
    name: "Deep Learning",
    category: "Artificial Intelligence",
    aliases: ["deep learning", "deep-learning"],
  },
  {
    name: "Artificial Intelligence",
    category: "Artificial Intelligence",
    aliases: ["artificial intelligence", "ai"],
  },
  {
    name: "Natural Language Processing",
    category: "Artificial Intelligence",
    aliases: ["natural language processing", "nlp"],
  },
  {
    name: "Data Science",
    category: "Data Science",
    aliases: ["data science", "data-science"],
  },
  {
    name: "Data Analysis",
    category: "Data Science",
    aliases: ["data analysis", "data analytics", "data-analysis"],
  },
  {
    name: "Data Visualization",
    category: "Data Science",
    aliases: ["data visualization", "data visualisation"],
  },
  {
    name: "Power BI",
    category: "Data Visualization",
    aliases: ["power bi", "powerbi"],
  },
  {
    name: "Tableau",
    category: "Data Visualization",
    aliases: ["tableau"],
  },
  {
    name: "Excel",
    category: "Data Analysis",
    aliases: ["excel", "microsoft excel"],
  },
  {
    name: "Apache Spark",
    category: "Big Data",
    aliases: ["apache spark", "spark"],
  },
  {
    name: "PySpark",
    category: "Big Data",
    aliases: ["pyspark", "py spark"],
  },
  {
    name: "REST API",
    category: "Backend Development",
    aliases: ["rest api", "restful api", "restful services"],
  },
  {
    name: "Project Management",
    category: "Professional",
    aliases: ["project management"],
  },
  {
    name: "Communication",
    category: "Professional",
    aliases: ["communication", "verbal communication"],
  },
  {
    name: "Leadership",
    category: "Professional",
    aliases: ["leadership", "team leadership"],
  },
  {
    name: "Problem Solving",
    category: "Professional",
    aliases: ["problem solving", "problem-solving"],
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[()[\]{}.,:;!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAlias(text: string, alias: string): boolean {
  const normalizedAlias = normalizeText(alias);

  const escapedAlias = normalizedAlias.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|\\s)${escapedAlias}(?=\\s|$)`,
    "i"
  );

  return pattern.test(text);
}

function findEvidence(
  resumeText: string,
  aliases: string[]
): string {
  const lines = resumeText.split(/\r?\n/);

  for (const line of lines) {
    const normalizedLine = normalizeText(line);

    if (
      aliases.some((alias) =>
        containsAlias(normalizedLine, alias)
      )
    ) {
      return line.trim();
    }
  }

  return "";
}

export function extractSkills(
  resumeText: string
): ExtractedSkill[] {
  const normalizedText = normalizeText(resumeText);

  const extractedSkills: ExtractedSkill[] = [];

  for (const skill of SKILL_PATTERNS) {
    const matched = skill.aliases.some((alias) =>
      containsAlias(normalizedText, alias)
    );

    if (!matched) {
      continue;
    }

    const evidence = findEvidence(
      resumeText,
      skill.aliases
    );

    extractedSkills.push({
      name: skill.name,
      category: skill.category,
      confidence: evidence ? 0.95 : 0.85,
      evidence,
    });
  }

  return extractedSkills;
}

export function getSkillNames(
  resumeText: string
): string[] {
  return extractSkills(resumeText).map(
    (skill) => skill.name
  );
}

export function groupSkillsByCategory(
  resumeText: string
): Record<string, ExtractedSkill[]> {
  const skills = extractSkills(resumeText);

  return skills.reduce(
    (groups, skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }

      groups[skill.category].push(skill);

      return groups;
    },
    {} as Record<string, ExtractedSkill[]>
  );
}
