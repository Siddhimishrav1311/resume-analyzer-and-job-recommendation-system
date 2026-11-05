import json
import sys
from pathlib import Path

import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "ml" / "models"
DATA_DIR = PROJECT_ROOT / "ml" / "data"

MODEL_PATH = MODEL_DIR / "final_suitability_model.joblib"
SCALER_PATH = MODEL_DIR / "final_matching_scaler.joblib"
VECTORIZER_PATH = MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"
JOB_PROFILES_PATH = DATA_DIR / "job_profiles.json"


# ---------------------------------------------------------
# SKILLS
# ---------------------------------------------------------

SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "sql",
    "r",
    "go",
    "rust",
    "kotlin",
    "php",
    "html",
    "css",
    "react",
    "next.js",
    "node.js",
    "express",
    "angular",
    "vue",
    "django",
    "flask",
    "fastapi",
    "spring",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "keras",
    "xgboost",
    "pandas",
    "numpy",
    "matplotlib",
    "seaborn",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "nlp",
    "computer vision",
    "data science",
    "data analysis",
    "data engineering",
    "power bi",
    "tableau",
    "excel",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "jenkins",
    "git",
    "github",
    "gitlab",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "spark",
    "hadoop",
    "kafka",
    "linux",
    "rest",
    "graphql",
]


KEYWORDS = [
    "analytics",
    "analysis",
    "data",
    "database",
    "dashboard",
    "visualization",
    "statistics",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "nlp",
    "computer vision",
    "etl",
    "pipeline",
    "cloud",
    "deployment",
    "software development",
    "programming",
    "api",
    "testing",
    "debugging",
    "devops",
    "ci/cd",
    "requirements",
    "stakeholder",
    "business requirements",
    "reporting",
    "model deployment",
]


# ---------------------------------------------------------
# TEXT HELPERS
# ---------------------------------------------------------

def clean_text(text):
    return " ".join(str(text).lower().split())


def contains_phrase(text, phrase):
    text = clean_text(text)
    phrase = clean_text(phrase)

    if not phrase:
        return False

    return phrase in text


def extract_skills(text):
    text = clean_text(text)

    found = []

    for skill in SKILLS:
        if contains_phrase(text, skill):
            found.append(skill)

    return found


def extract_keywords(text):
    text = clean_text(text)

    found = []

    for keyword in KEYWORDS:
        if contains_phrase(text, keyword):
            found.append(keyword)

    return found


def get_ngram_overlap(resume_tokens, job_tokens, n):
    if len(resume_tokens) < n or len(job_tokens) < n:
        return 0.0

    resume_ngrams = {
        tuple(resume_tokens[i:i + n])
        for i in range(len(resume_tokens) - n + 1)
    }

    job_ngrams = {
        tuple(job_tokens[i:i + n])
        for i in range(len(job_tokens) - n + 1)
    }

    if not job_ngrams:
        return 0.0

    return len(resume_ngrams & job_ngrams) / len(job_ngrams)


def extract_experience(text):
    text = clean_text(text)

    import re

    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+(?:of\s+)?experience",
        r"(\d+(?:\.\d+)?)\+?\s+years?\s+exp",
    ]

    values = []

    for pattern in patterns:
        matches = re.findall(pattern, text)

        for match in matches:
            try:
                values.append(float(match))
            except ValueError:
                pass

    if not values:
        return 0.0

    return max(values)


# ---------------------------------------------------------
# MATCHING FEATURES
# ---------------------------------------------------------

def build_matching_features(resume_text, job_text):
    resume = clean_text(resume_text)
    job = clean_text(job_text)

    resume_skills = extract_skills(resume)
    job_skills = extract_skills(job)

    resume_skill_set = set(resume_skills)
    job_skill_set = set(job_skills)

    matched_skills = resume_skill_set & job_skill_set
    missing_skills = job_skill_set - resume_skill_set

    resume_keywords = extract_keywords(resume)
    job_keywords = extract_keywords(job)

    resume_keyword_set = set(resume_keywords)
    job_keyword_set = set(job_keywords)

    matched_keywords = (
        resume_keyword_set & job_keyword_set
    )

    resume_tokens = resume.split()
    job_tokens = job.split()

    resume_skill_count = len(resume_skill_set)
    job_skill_count = len(job_skill_set)
    matched_skill_count = len(matched_skills)
    missing_skill_count = len(missing_skills)

    if job_skill_count > 0:
        skill_match_ratio = (
            matched_skill_count / job_skill_count
        )
    else:
        skill_match_ratio = 0.0

    if resume_skill_count > 0:
        resume_skill_coverage = (
            matched_skill_count / resume_skill_count
        )
    else:
        resume_skill_coverage = 0.0

    resume_keyword_count = len(resume_keyword_set)
    job_keyword_count = len(job_keyword_set)
    matched_keyword_count = len(matched_keywords)

    if job_keyword_count > 0:
        keyword_match_ratio = (
            matched_keyword_count / job_keyword_count
        )
    else:
        keyword_match_ratio = 0.0

    if resume_keyword_count > 0:
        resume_keyword_coverage = (
            matched_keyword_count / resume_keyword_count
        )
    else:
        resume_keyword_coverage = 0.0

    unigram_overlap = get_ngram_overlap(
        resume_tokens,
        job_tokens,
        1,
    )

    bigram_overlap = get_ngram_overlap(
        resume_tokens,
        job_tokens,
        2,
    )

    trigram_overlap = get_ngram_overlap(
        resume_tokens,
        job_tokens,
        3,
    )

    resume_char_count = len(resume)
    job_char_count = len(job)

    resume_word_count = len(resume_tokens)
    job_word_count = len(job_tokens)

    if job_word_count > 0:
        resume_to_job_word_ratio = (
            resume_word_count / job_word_count
        )
    else:
        resume_to_job_word_ratio = 0.0

    resume_experience = extract_experience(resume)
    job_experience = extract_experience(job)

    if job_experience > 0:
        experience_ratio = (
            resume_experience / job_experience
        )
    else:
        experience_ratio = 1.0

    return np.array(
        [
            resume_skill_count,
            job_skill_count,
            matched_skill_count,
            missing_skill_count,
            skill_match_ratio,
            resume_skill_coverage,
            resume_keyword_count,
            job_keyword_count,
            matched_keyword_count,
            keyword_match_ratio,
            resume_keyword_coverage,
            unigram_overlap,
            bigram_overlap,
            trigram_overlap,
            resume_char_count,
            job_char_count,
            resume_word_count,
            job_word_count,
            resume_to_job_word_ratio,
            resume_experience,
            job_experience,
            experience_ratio,
        ],
        dtype=float,
    )


# ---------------------------------------------------------
# LOAD MODELS
# ---------------------------------------------------------

def load_resources():
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    with open(
        JOB_PROFILES_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        job_profiles = json.load(file)

    return (
        model,
        scaler,
        vectorizer,
        job_profiles,
    )


# ---------------------------------------------------------
# PREDICT ONE ROLE
# ---------------------------------------------------------

def predict_role(
    resume_text,
    job_description,
    model,
    scaler,
    vectorizer,
):
    resume_clean = clean_text(resume_text)
    job_clean = clean_text(job_description)

    resume_tfidf = vectorizer.transform(
        [resume_clean]
    )

    job_tfidf = vectorizer.transform(
        [job_clean]
    )

    matching_features = build_matching_features(
        resume_clean,
        job_clean,
    )

    matching_features_scaled = scaler.transform(
        matching_features.reshape(1, -1)
    )

    features = np.hstack(
        [
            resume_tfidf.toarray(),
            job_tfidf.toarray(),
            matching_features_scaled,
        ]
    )

    prediction = model.predict(features)[0]

    score = float(
        np.clip(prediction, 0, 100)
    )

    return round(score, 2)


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

def predict_all_roles(resume_text):
    (
        model,
        scaler,
        vectorizer,
        job_profiles,
    ) = load_resources()

    results = []

    for role in job_profiles:
        score = predict_role(
            resume_text,
            role["description"],
            model,
            scaler,
            vectorizer,
        )

        results.append(
            {
                "id": role["id"],
                "title": role["title"],
                "score": score,
            }
        )

    results.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return results


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(
            json.dumps(
                {
                    "error": (
                        "Usage: python predict_roles.py "
                        '"resume text"'
                    )
                }
            )
        )
        sys.exit(1)

    resume_text = sys.argv[1]

    if not resume_text.strip():
        print(
            json.dumps(
                {
                    "error": "Resume text is empty."
                }
            )
        )
        sys.exit(1)

    try:
        results = predict_all_roles(
            resume_text
        )

        print(
            json.dumps(
                {
                    "results": results,
                    "model": "final_suitability_model",
                }
            )
        )

    except Exception as error:
        print(
            json.dumps(
                {
                    "error": str(error)
                }
            )
        )
        sys.exit(1)