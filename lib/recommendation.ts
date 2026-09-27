export type JobRecommendation = {
  title: string;
  company: string;
  location: string;
  match: number;
  reason: string;
};

export function generateRecommendations(
  resumeText: string
): JobRecommendation[] {
  const text = resumeText.toLowerCase();

  const recommendations: JobRecommendation[] = [];

  if (
    text.includes("python") ||
    text.includes("pandas") ||
    text.includes("numpy") ||
    text.includes("data analysis")
  ) {
    recommendations.push({
      title: "Data Analyst",
      company: "CareerMatch Jobs",
      location: "Bangalore, India",
      match: 92,
      reason:
        "Your resume contains Python and data-analysis related skills.",
    });
  }

  if (
    text.includes("machine learning") ||
    text.includes("scikit-learn") ||
    text.includes("tensorflow")
  ) {
    recommendations.push({
      title: "Machine Learning Engineer",
      company: "CareerMatch Jobs",
      location: "Hyderabad, India",
      match: 88,
      reason:
        "Your resume contains machine-learning related skills.",
    });
  }

  if (
    text.includes("react") ||
    text.includes("next.js") ||
    text.includes("javascript") ||
    text.includes("typescript")
  ) {
    recommendations.push({
      title: "Frontend Developer",
      company: "CareerMatch Jobs",
      location: "Pune, India",
      match: 86,
      reason:
        "Your resume contains modern frontend development skills.",
    });
  }

  if (
    text.includes("sql") ||
    text.includes("postgresql") ||
    text.includes("mysql")
  ) {
    recommendations.push({
      title: "Data Engineer",
      company: "CareerMatch Jobs",
      location: "Mumbai, India",
      match: 84,
      reason:
        "Your resume contains SQL and database-related skills.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Software Engineer",
      company: "CareerMatch Jobs",
      location: "India",
      match: 70,
      reason:
        "Upload more detailed skills and experience to improve job matching.",
    });
  }

  return recommendations.slice(0, 4);
}