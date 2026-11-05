import re
import pandas as pd
import numpy as np

from pathlib import Path
from collections import Counter


DATA_DIR = Path("ml/data")

TRAIN_FILE = DATA_DIR / "train_prepared.csv"
VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"

TRAIN_OUTPUT = DATA_DIR / "train_matching_features.npy"
VALIDATION_OUTPUT = DATA_DIR / "validation_matching_features.npy"


print("=" * 70)
print("BUILDING RESUME-JOB MATCHING FEATURES")
print("=" * 70)


# ---------------------------------------------------------
# COMMON SKILLS
# ---------------------------------------------------------

SKILLS = {
    # Programming
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "r",
    "go",
    "rust",
    "php",
    "ruby",
    "scala",
    "kotlin",
    "swift",

    # Web
    "html",
    "css",
    "react",
    "react.js",
    "next.js",
    "angular",
    "vue",
    "node.js",
    "express",
    "django",
    "flask",

    # Data
    "sql",
    "mysql",
    "postgresql",
    "postgres",
    "mongodb",
    "nosql",
    "pandas",
    "numpy",
    "scipy",
    "matplotlib",
    "seaborn",
    "power bi",
    "tableau",
    "excel",
    "spark",
    "pyspark",
    "hadoop",
    "databricks",

    # Machine Learning / AI
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "nlp",
    "natural language processing",
    "computer vision",
    "tensorflow",
    "pytorch",
    "keras",
    "scikit-learn",
    "xgboost",
    "opencv",

    # Cloud
    "aws",
    "amazon web services",
    "azure",
    "microsoft azure",
    "gcp",
    "google cloud",
    "docker",
    "kubernetes",
    "terraform",

    # DevOps
    "git",
    "github",
    "gitlab",
    "jenkins",
    "ci/cd",
    "linux",

    # Databases
    "oracle",
    "redis",
    "sqlite",
    "firebase",

    # Analytics / BI
    "data analysis",
    "data analytics",
    "business intelligence",
    "statistics",
    "data visualization",

    # Software engineering
    "rest api",
    "restful api",
    "api",
    "microservices",
    "object oriented programming",
    "oop",
    "software development",
    "agile",
    "scrum",

    # Other technical skills
    "git",
    "jira",
    "figma",
    "matlab",
    "arduino",
    "raspberry pi",
}


# ---------------------------------------------------------
# TEXT PROCESSING
# ---------------------------------------------------------

def normalize_text(text):
    text = str(text).lower()

    # Normalize common variations.
    replacements = {
        "react.js": "react",
        "node.js": "nodejs",
        "next.js": "nextjs",
        "power-bi": "power bi",
        "machine-learning": "machine learning",
        "deep-learning": "deep learning",
        "data-analysis": "data analysis",
        "data-analytics": "data analytics",
        "natural-language-processing":
            "natural language processing",
        "scikit learn":
            "scikit-learn",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(
        r"[^a-z0-9+#./ -]",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ---------------------------------------------------------
# TOKENIZATION
# ---------------------------------------------------------

def tokenize(text):
    text = normalize_text(text)

    tokens = re.findall(
        r"[a-z0-9+#.]+",
        text,
    )

    return tokens


# ---------------------------------------------------------
# N-GRAMS
# ---------------------------------------------------------

def generate_ngrams(tokens, n):
    return {
        " ".join(tokens[i:i + n])
        for i in range(len(tokens) - n + 1)
    }


def get_text_features(text):
    normalized = normalize_text(text)

    tokens = tokenize(normalized)

    unigrams = set(tokens)

    bigrams = generate_ngrams(
        tokens,
        2,
    )

    trigrams = generate_ngrams(
        tokens,
        3,
    )

    return (
        normalized,
        tokens,
        unigrams,
        bigrams,
        trigrams,
    )


# ---------------------------------------------------------
# SKILL EXTRACTION
# ---------------------------------------------------------

def extract_skills(text):
    normalized = normalize_text(text)

    found = set()

    for skill in SKILLS:

        normalized_skill = normalize_text(skill)

        # Exact phrase/word boundary matching.
        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(normalized_skill)
            + r"(?![a-z0-9])"
        )

        if re.search(
            pattern,
            normalized,
        ):
            found.add(normalized_skill)

    return found


# ---------------------------------------------------------
# KEYWORD EXTRACTION
# ---------------------------------------------------------

STOPWORDS = {
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "a",
    "an",
    "is",
    "are",
    "be",
    "as",
    "at",
    "by",
    "from",
    "this",
    "that",
    "will",
    "can",
    "should",
    "you",
    "your",
    "we",
    "our",
    "their",
    "they",
    "it",
    "its",
    "have",
    "has",
    "had",
    "using",
    "use",
    "work",
    "working",
    "job",
    "role",
    "position",
    "candidate",
    "experience",
    "years",
    "required",
    "preferred",
    "skills",
    "responsibilities",
    "requirements",
}


def extract_keywords(text):
    tokens = tokenize(text)

    keywords = set()

    for token in tokens:

        if len(token) < 3:
            continue

        if token in STOPWORDS:
            continue

        if token.isdigit():
            continue

        keywords.add(token)

    return keywords


# ---------------------------------------------------------
# JACCARD SIMILARITY
# ---------------------------------------------------------

def jaccard_similarity(set_a, set_b):

    if not set_a and not set_b:
        return 0.0

    union = set_a | set_b

    if not union:
        return 0.0

    intersection = set_a & set_b

    return len(intersection) / len(union)


# ---------------------------------------------------------
# BUILD FEATURES FOR ONE ROW
# ---------------------------------------------------------

def build_features(resume, job):

    (
        resume_normalized,
        resume_tokens,
        resume_unigrams,
        resume_bigrams,
        resume_trigrams,
    ) = get_text_features(resume)

    (
        job_normalized,
        job_tokens,
        job_unigrams,
        job_bigrams,
        job_trigrams,
    ) = get_text_features(job)


    # -----------------------------------------------------
    # SKILLS
    # -----------------------------------------------------

    resume_skills = extract_skills(
        resume_normalized
    )

    job_skills = extract_skills(
        job_normalized
    )

    matched_skills = (
        resume_skills & job_skills
    )

    missing_skills = (
        job_skills - resume_skills
    )


    if len(job_skills) > 0:

        skill_match_ratio = (
            len(matched_skills)
            / len(job_skills)
        )

    else:

        skill_match_ratio = 0.0


    # -----------------------------------------------------
    # KEYWORDS
    # -----------------------------------------------------

    resume_keywords = extract_keywords(
        resume_normalized
    )

    job_keywords = extract_keywords(
        job_normalized
    )

    matched_keywords = (
        resume_keywords & job_keywords
    )


    if len(job_keywords) > 0:

        keyword_match_ratio = (
            len(matched_keywords)
            / len(job_keywords)
        )

    else:

        keyword_match_ratio = 0.0


    # -----------------------------------------------------
    # N-GRAM MATCHING
    # -----------------------------------------------------

    unigram_overlap = jaccard_similarity(
        resume_unigrams,
        job_unigrams,
    )

    bigram_overlap = jaccard_similarity(
        resume_bigrams,
        job_bigrams,
    )

    trigram_overlap = jaccard_similarity(
        resume_trigrams,
        job_trigrams,
    )


    # -----------------------------------------------------
    # TEXT LENGTH FEATURES
    # -----------------------------------------------------

    resume_chars = len(
        resume_normalized
    )

    job_chars = len(
        job_normalized
    )

    resume_words = len(
        resume_tokens
    )

    job_words = len(
        job_tokens
    )


    # -----------------------------------------------------
    # COVERAGE FEATURES
    # -----------------------------------------------------

    if len(resume_keywords) > 0:

        resume_keyword_coverage = (
            len(matched_keywords)
            / len(resume_keywords)
        )

    else:

        resume_keyword_coverage = 0.0


    if len(resume_skills) > 0:

        resume_skill_coverage = (
            len(matched_skills)
            / len(resume_skills)
        )

    else:

        resume_skill_coverage = 0.0


    # -----------------------------------------------------
    # LENGTH RATIO
    # -----------------------------------------------------

    if job_words > 0:

        resume_to_job_word_ratio = (
            resume_words / job_words
        )

    else:

        resume_to_job_word_ratio = 0.0


    # -----------------------------------------------------
    # EXPERIENCE SIGNALS
    # -----------------------------------------------------

    experience_pattern = re.compile(
        r"\b(\d{1,2})\+?\s*(?:years?|yrs?)\b"
    )

    resume_experience_matches = (
        experience_pattern.findall(
            resume_normalized
        )
    )

    job_experience_matches = (
        experience_pattern.findall(
            job_normalized
        )
    )


    resume_max_experience = 0.0
    job_required_experience = 0.0


    if resume_experience_matches:

        resume_max_experience = max(
            float(x)
            for x in resume_experience_matches
        )


    if job_experience_matches:

        job_required_experience = max(
            float(x)
            for x in job_experience_matches
        )


    if job_required_experience > 0:

        experience_ratio = min(
            resume_max_experience
            / job_required_experience,
            2.0,
        )

    else:

        experience_ratio = 1.0


    # -----------------------------------------------------
    # FINAL FEATURE VECTOR
    # -----------------------------------------------------

    features = [

        # Skill matching
        len(resume_skills),
        len(job_skills),
        len(matched_skills),
        len(missing_skills),
        skill_match_ratio,
        resume_skill_coverage,

        # Keyword matching
        len(resume_keywords),
        len(job_keywords),
        len(matched_keywords),
        keyword_match_ratio,
        resume_keyword_coverage,

        # N-gram similarity
        unigram_overlap,
        bigram_overlap,
        trigram_overlap,

        # Text size
        resume_chars,
        job_chars,
        resume_words,
        job_words,
        resume_to_job_word_ratio,

        # Experience
        resume_max_experience,
        job_required_experience,
        experience_ratio,
    ]

    return features


# ---------------------------------------------------------
# PROCESS DATASET
# ---------------------------------------------------------

def process_dataset(input_file, output_file):

    print("\n")
    print("-" * 70)
    print(f"Processing: {input_file}")
    print("-" * 70)

    df = pd.read_csv(input_file)

    feature_rows = []

    for index, row in df.iterrows():

        if index % 500 == 0:

            print(
                f"Processing row "
                f"{index}/{len(df)}..."
            )

        features = build_features(
            row["resume_text"],
            row["job_text"],
        )

        feature_rows.append(
            features
        )

    feature_array = np.asarray(
        feature_rows,
        dtype=np.float32,
    )

    np.save(
        output_file,
        feature_array,
    )

    print(
        f"\nSaved: {output_file}"
    )

    print(
        f"Shape: {feature_array.shape}"
    )

    return feature_array


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

print("\nStarting feature extraction...")

train_features = process_dataset(
    TRAIN_FILE,
    TRAIN_OUTPUT,
)

validation_features = process_dataset(
    VALIDATION_FILE,
    VALIDATION_OUTPUT,
)


# ---------------------------------------------------------
# FEATURE INFORMATION
# ---------------------------------------------------------

FEATURE_NAMES = [

    "resume_skill_count",
    "job_skill_count",
    "matched_skill_count",
    "missing_skill_count",
    "skill_match_ratio",
    "resume_skill_coverage",

    "resume_keyword_count",
    "job_keyword_count",
    "matched_keyword_count",
    "keyword_match_ratio",
    "resume_keyword_coverage",

    "unigram_overlap",
    "bigram_overlap",
    "trigram_overlap",

    "resume_char_count",
    "job_char_count",
    "resume_word_count",
    "job_word_count",
    "resume_to_job_word_ratio",

    "resume_max_experience",
    "job_required_experience",
    "experience_ratio",
]


print("\n")
print("=" * 70)
print("FEATURE EXTRACTION COMPLETE")
print("=" * 70)

print(
    f"\nNumber of features: "
    f"{len(FEATURE_NAMES)}"
)

print("\nFeatures:")

for index, name in enumerate(
    FEATURE_NAMES
):

    print(
        f"{index:2d}. {name}"
    )


print("\n")
print("Train shape:")
print(train_features.shape)

print("\nValidation shape:")
print(validation_features.shape)


# ---------------------------------------------------------
# BASIC FEATURE STATISTICS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("FEATURE STATISTICS")
print("=" * 70)

for index, name in enumerate(
    FEATURE_NAMES
):

    train_column = train_features[:, index]

    print(
        f"{name:30s} "
        f"mean={train_column.mean():8.3f} "
        f"min={train_column.min():8.3f} "
        f"max={train_column.max():8.3f}"
    )


print("\nFeature building complete!")
