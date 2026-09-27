export type ATSResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordMatchPercentage: number;
};

const ATS_KEYWORDS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "sql",
  "mysql",
  "postgresql",
  "mongodb",
  "html",
  "css",
  "tailwind",
  "git",
  "github",
  "docker",
  "aws",
  "azure",
  "gcp",
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "ai",
  "data science",
  "data analysis",
  "data visualization",
  "power bi",
  "tableau",
  "pandas",
  "numpy",
  "scikit-learn",
  "tensorflow",
  "pytorch",
  "nlp",
  "natural language processing",
  "excel",
  "spark",
  "pyspark",
  "rest api",
  "api",
  "agile",
  "communication",
  "leadership",
  "problem solving",
  "project management",
];

export function calculateATSScore(resumeText: string): ATSResult {
  const text = resumeText.toLowerCase();

  const matchedKeywords = ATS_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  const missingKeywords = ATS_KEYWORDS.filter(
    (keyword) => !text.includes(keyword.toLowerCase())
  );

  const keywordMatchPercentage =
    ATS_KEYWORDS.length === 0
      ? 0
      : Math.round(
          (matchedKeywords.length / ATS_KEYWORDS.length) * 100
        );

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(keywordMatchPercentage * 0.7 + 30)
    )
  );

  return {
    score,
    matchedKeywords,
    missingKeywords,
    keywordMatchPercentage,
  };
}