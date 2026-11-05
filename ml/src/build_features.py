import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

TRAIN_FILE = DATA_DIR / "train_prepared.csv"
VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text):
    """Basic text normalization."""
    text = str(text).lower()
    text = " ".join(text.split())
    return text


def build_features(train_df, validation_df):

    print("\nBuilding shared TF-IDF features...")

    # ---------------------------------------------------------
    # Clean text
    # ---------------------------------------------------------

    train_resume = train_df["resume_text"].apply(clean_text)
    train_job = train_df["job_text"].apply(clean_text)

    validation_resume = validation_df["resume_text"].apply(clean_text)
    validation_job = validation_df["job_text"].apply(clean_text)

    # ---------------------------------------------------------
    # Combine resume + job text for fitting ONE vocabulary
    # ---------------------------------------------------------

    combined_train_text = pd.concat(
        [train_resume, train_job],
        ignore_index=True
    )

    # ---------------------------------------------------------
    # Shared TF-IDF vectorizer
    # ---------------------------------------------------------

    vectorizer = TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
        stop_words="english",
    )

    vectorizer.fit(combined_train_text)

    # ---------------------------------------------------------
    # Transform resume and job using SAME vocabulary
    # ---------------------------------------------------------

    train_resume_tfidf = vectorizer.transform(train_resume)
    train_job_tfidf = vectorizer.transform(train_job)

    validation_resume_tfidf = vectorizer.transform(
        validation_resume
    )

    validation_job_tfidf = vectorizer.transform(
        validation_job
    )

    print(
        "Resume TF-IDF shape:",
        train_resume_tfidf.shape
    )

    print(
        "Job TF-IDF shape:",
        train_job_tfidf.shape
    )

    # ---------------------------------------------------------
    # Resume ↔ Job cosine similarity
    # ---------------------------------------------------------

    train_similarity = np.diag(
        cosine_similarity(
            train_resume_tfidf,
            train_job_tfidf
        )
    )

    validation_similarity = np.diag(
        cosine_similarity(
            validation_resume_tfidf,
            validation_job_tfidf
        )
    )

    print(
        "\nTrain similarity range:",
        round(train_similarity.min(), 4),
        "to",
        round(train_similarity.max(), 4)
    )

    print(
        "Validation similarity range:",
        round(validation_similarity.min(), 4),
        "to",
        round(validation_similarity.max(), 4)
    )

    # ---------------------------------------------------------
    # Text length features
    # ---------------------------------------------------------

    train_resume_length = (
        train_resume.str.len().to_numpy()
    )

    train_job_length = (
        train_job.str.len().to_numpy()
    )

    validation_resume_length = (
        validation_resume.str.len().to_numpy()
    )

    validation_job_length = (
        validation_job.str.len().to_numpy()
    )

    # ---------------------------------------------------------
    # Word count features
    # ---------------------------------------------------------

    train_resume_words = (
        train_resume.str.split().str.len().to_numpy()
    )

    train_job_words = (
        train_job.str.split().str.len().to_numpy()
    )

    validation_resume_words = (
        validation_resume.str.split().str.len().to_numpy()
    )

    validation_job_words = (
        validation_job.str.split().str.len().to_numpy()
    )

    # ---------------------------------------------------------
    # Engineered numerical features
    # ---------------------------------------------------------

    train_features = np.column_stack(
        [
            train_similarity,
            train_resume_length,
            train_job_length,
            train_resume_words,
            train_job_words,
        ]
    )

    validation_features = np.column_stack(
        [
            validation_similarity,
            validation_resume_length,
            validation_job_length,
            validation_resume_words,
            validation_job_words,
        ]
    )

    print("\nEngineered feature shape:")
    print("Train:", train_features.shape)
    print("Validation:", validation_features.shape)

    return (
        train_features,
        validation_features,
        vectorizer,
    )


print("=" * 60)
print("BUILDING ML FEATURES")
print("=" * 60)

train_df = pd.read_csv(TRAIN_FILE)
validation_df = pd.read_csv(VALIDATION_FILE)

print("\nTraining rows:", len(train_df))
print("Validation rows:", len(validation_df))


(
    train_features,
    validation_features,
    vectorizer,
) = build_features(
    train_df,
    validation_df
)


# -------------------------------------------------------------
# Save vectorizer
# -------------------------------------------------------------

joblib.dump(
    vectorizer,
    MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"
)


# -------------------------------------------------------------
# Save engineered features
# -------------------------------------------------------------

np.save(
    DATA_DIR / "train_engineered_features.npy",
    train_features
)

np.save(
    DATA_DIR / "validation_engineered_features.npy",
    validation_features
)


# -------------------------------------------------------------
# Save targets
# -------------------------------------------------------------

train_targets = train_df["ats_score"].to_numpy()

validation_targets = (
    validation_df["ats_score"].to_numpy()
)

np.save(
    DATA_DIR / "train_targets.npy",
    train_targets
)

np.save(
    DATA_DIR / "validation_targets.npy",
    validation_targets
)


print("\n" + "=" * 60)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 60)

print("\nSaved files:")
print("- ml/models/resume_job_tfidf_vectorizer.joblib")
print("- ml/data/train_engineered_features.npy")
print("- ml/data/validation_engineered_features.npy")
print("- ml/data/train_targets.npy")
print("- ml/data/validation_targets.npy")