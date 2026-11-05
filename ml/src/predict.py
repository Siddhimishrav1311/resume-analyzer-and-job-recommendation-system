import sys
import json
import re
import joblib
import numpy as np

from pathlib import Path
from scipy.sparse import hstack, csr_matrix


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BASE_DIR / "ml" / "models"

MODEL_FILE = MODEL_DIR / "final_suitability_model.joblib"
SCALER_FILE = MODEL_DIR / "final_matching_scaler.joblib"
VECTORIZER_FILE = MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"


# ============================================================
# LOAD MODELS
# ============================================================

model = joblib.load(MODEL_FILE)
scaler = joblib.load(SCALER_FILE)
vectorizer = joblib.load(VECTORIZER_FILE)


# ============================================================
# SKILL / KEYWORD LIST
# ============================================================

SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "sql",
    "r",
    "go",
    "rust",
    "scala",
    "kotlin",
    "php",
    "html",
    "css",

    "react",
    "react.js",
    "next.js",
    "node.js",
    "express",
    "angular",
    "vue",

    "django",
    "flask",
    "fastapi",
    "spring",
    "spring boot",

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
    "natural language processing",
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
    "google cloud",

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
    "rest api",
    "graphql",
]


KEYWORDS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "data science",
    "data analysis",
    "data engineering",
    "nlp",
    "computer vision",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "xgboost",
    "pandas",
    "numpy",
    "power bi",
    "tableau",
    "excel",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "github",
    "mongodb",
    "postgresql",
    "mysql",
    "spark",
    "hadoop",
    "kafka",
    "react",
    "next.js",
    "node.js",
    "angular",
    "vue",
    "django",
    "flask",
    "fastapi",
    "rest api",
]


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):
    text = str(text).lower()
    return " ".join(text.split())


# ============================================================
# TOKEN HELPERS
# ============================================================

def normalize_phrase(phrase):
    return re.sub(r"[^a-z0-9+#.\- ]", " ", phrase.lower())


def contains_phrase(text, phrase):
    text = normalize_phrase(text)
    phrase = normalize_phrase(phrase)

    pattern = r"(?<![a-z0-9])" + re.escape(phrase) + r"(?![a-z0-9])"

    return bool(re.search(pattern, text))


def extract_matches(text, vocabulary):
    matches = []

    for item in vocabulary:
        if contains_phrase(text, item):
            matches.append(item)

    return matches


# ============================================================
# N-GRAM OVERLAP
# ============================================================

def get_ngrams(text, n):
    words = re.findall(r"[a-z0-9+#.\-]+", text.lower())

    if len(words) < n:
        return set()

    return {
        " ".join(words[i:i+n])
        for i in range(len(words) - n + 1)
    }


def overlap_ratio(resume_set, job_set):
    if not job_set:
        return 0.0

    return len(resume_set.intersection(job_set)) / len(job_set)


# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================

def extract_max_experience(text):
    text = text.lower()

    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience",
        r"experience\s*(?:of|:)?\s*(\d+)\+?\s*(?:years?|yrs?)",
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(pattern, text)

        for value in matches:

            try:
                values.append(float(value))
            except ValueError:
                pass

    if not values:
        return 0.0

    return max(values)


# ============================================================
# BUILD 22 MATCHING FEATURES
# ============================================================

def build_matching_features(resume, job):

    resume = clean_text(resume)
    job = clean_text(job)

    resume_skills = extract_matches(resume, SKILLS)
    job_skills = extract_matches(job, SKILLS)

    matched_skills = set(resume_skills).intersection(
        set(job_skills)
    )

    missing_skills = set(job_skills).difference(
        set(resume_skills)
    )

    resume_keywords = extract_matches(resume, KEYWORDS)
    job_keywords = extract_matches(job, KEYWORDS)

    matched_keywords = set(resume_keywords).intersection(
        set(job_keywords)
    )

    resume_skill_count = len(resume_skills)
    job_skill_count = len(job_skills)
    matched_skill_count = len(matched_skills)
    missing_skill_count = len(missing_skills)

    skill_match_ratio = (
        matched_skill_count / job_skill_count
        if job_skill_count
        else 0.0
    )

    resume_skill_coverage = (
        matched_skill_count / resume_skill_count
        if resume_skill_count
        else 0.0
    )

    resume_keyword_count = len(resume_keywords)
    job_keyword_count = len(job_keywords)
    matched_keyword_count = len(matched_keywords)

    keyword_match_ratio = (
        matched_keyword_count / job_keyword_count
        if job_keyword_count
        else 0.0
    )

    resume_keyword_coverage = (
        matched_keyword_count / resume_keyword_count
        if resume_keyword_count
        else 0.0
    )

    resume_unigrams = get_ngrams(resume, 1)
    job_unigrams = get_ngrams(job, 1)

    resume_bigrams = get_ngrams(resume, 2)
    job_bigrams = get_ngrams(job, 2)

    resume_trigrams = get_ngrams(resume, 3)
    job_trigrams = get_ngrams(job, 3)

    unigram_overlap = overlap_ratio(
        resume_unigrams,
        job_unigrams,
    )

    bigram_overlap = overlap_ratio(
        resume_bigrams,
        job_bigrams,
    )

    trigram_overlap = overlap_ratio(
        resume_trigrams,
        job_trigrams,
    )

    resume_char_count = len(resume)
    job_char_count = len(job)

    resume_word_count = len(resume.split())
    job_word_count = len(job.split())

    resume_to_job_word_ratio = (
        resume_word_count / job_word_count
        if job_word_count
        else 0.0
    )

    resume_max_experience = extract_max_experience(
        resume
    )

    job_required_experience = extract_max_experience(
        job
    )

    experience_ratio = (
        min(
            resume_max_experience /
            job_required_experience,
            2.0,
        )
        if job_required_experience > 0
        else 0.0
    )

    features = np.array([
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
        resume_max_experience,
        job_required_experience,
        experience_ratio,
    ], dtype=float)

    return features


# ============================================================
# PREDICTION
# ============================================================

def predict(resume_text, job_text):

    resume_text = clean_text(resume_text)
    job_text = clean_text(job_text)

    if not resume_text:
        raise ValueError("Resume text is empty.")

    if not job_text:
        raise ValueError("Job description is empty.")

    # TF-IDF
    resume_tfidf = vectorizer.transform(
        [resume_text]
    )

    job_tfidf = vectorizer.transform(
        [job_text]
    )

    # Matching features
    matching_features = build_matching_features(
        resume_text,
        job_text,
    ).reshape(1, -1)

    matching_scaled = scaler.transform(
        matching_features
    )

    matching_sparse = csr_matrix(
        matching_scaled
    )

    # Combine exactly like training
    X = hstack(
        [
            resume_tfidf,
            job_tfidf,
            matching_sparse,
        ],
        format="csr",
    )

    score = float(
        np.clip(
            model.predict(X)[0],
            0,
            100,
        )
    )

    return {
        "score": round(score, 2),
        "model": "final_suitability_model",
    }


# ============================================================
# COMMAND LINE INTERFACE
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            json.dumps(
                {
                    "error": (
                        "Usage: python predict.py "
                        "\"resume text\" "
                        "\"job description\""
                    )
                }
            )
        )

        sys.exit(1)

    resume = sys.argv[1]
    job = sys.argv[2]

    try:

        result = predict(
            resume,
            job,
        )

        print(
            json.dumps(
                result
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