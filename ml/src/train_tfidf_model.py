import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from scipy.sparse import hstack, csr_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

TRAIN_FILE = DATA_DIR / "train_prepared.csv"
VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"

VECTORIZER_FILE = MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"
MODEL_FILE = MODEL_DIR / "tfidf_ridge_model.joblib"
SCALER_FILE = MODEL_DIR / "engineered_feature_scaler.joblib"


def clean_text(text):
    text = str(text).lower()
    return " ".join(text.split())


print("=" * 70)
print("TRAINING TEXT-BASED ATS / JOB SUITABILITY MODEL")
print("=" * 70)


# ---------------------------------------------------------
# 1. LOAD DATA
# ---------------------------------------------------------

print("\n[1/7] Loading prepared dataset...")

train_df = pd.read_csv(TRAIN_FILE)
validation_df = pd.read_csv(VALIDATION_FILE)

print(f"Training rows   : {len(train_df)}")
print(f"Validation rows : {len(validation_df)}")


# ---------------------------------------------------------
# 2. LOAD TRAINED TF-IDF VECTORIZER
# ---------------------------------------------------------

print("\n[2/7] Loading shared TF-IDF vectorizer...")

vectorizer = joblib.load(VECTORIZER_FILE)

print(f"TF-IDF vocabulary size: {len(vectorizer.vocabulary_)}")


# ---------------------------------------------------------
# 3. PREPARE TEXT
# ---------------------------------------------------------

print("\n[3/7] Preparing resume and job text...")

train_resume = train_df["resume_text"].apply(clean_text)
train_job = train_df["job_text"].apply(clean_text)

validation_resume = validation_df["resume_text"].apply(clean_text)
validation_job = validation_df["job_text"].apply(clean_text)


# ---------------------------------------------------------
# 4. TRANSFORM TEXT INTO TF-IDF FEATURES
# ---------------------------------------------------------

print("\n[4/7] Transforming text into TF-IDF features...")

train_resume_tfidf = vectorizer.transform(train_resume)
train_job_tfidf = vectorizer.transform(train_job)

validation_resume_tfidf = vectorizer.transform(validation_resume)
validation_job_tfidf = vectorizer.transform(validation_job)

print("Resume TF-IDF shape:")
print(train_resume_tfidf.shape)

print("Job TF-IDF shape:")
print(train_job_tfidf.shape)


# ---------------------------------------------------------
# 5. LOAD ENGINEERED FEATURES
# ---------------------------------------------------------

print("\n[5/7] Loading engineered features...")

train_engineered = np.load(
    DATA_DIR / "train_engineered_features.npy"
)

validation_engineered = np.load(
    DATA_DIR / "validation_engineered_features.npy"
)

print("Engineered train shape:")
print(train_engineered.shape)

print("Engineered validation shape:")
print(validation_engineered.shape)


# Scale numerical features so that text features are not
# overwhelmed by raw text length / word count values.

print("\nScaling engineered features...")

scaler = StandardScaler()

train_engineered_scaled = scaler.fit_transform(
    train_engineered
)

validation_engineered_scaled = scaler.transform(
    validation_engineered
)


# Convert dense numerical features into sparse matrices.

train_engineered_sparse = csr_matrix(
    train_engineered_scaled
)

validation_engineered_sparse = csr_matrix(
    validation_engineered_scaled
)


# ---------------------------------------------------------
# 6. COMBINE ALL FEATURES
# ---------------------------------------------------------

print("\n[6/7] Combining text + engineered features...")

X_train = hstack(
    [
        train_resume_tfidf,
        train_job_tfidf,
        train_engineered_sparse,
    ],
    format="csr",
)

X_validation = hstack(
    [
        validation_resume_tfidf,
        validation_job_tfidf,
        validation_engineered_sparse,
    ],
    format="csr",
)

y_train = train_df["ats_score"].to_numpy()
y_validation = validation_df["ats_score"].to_numpy()

print("\nFinal feature matrix:")
print(f"Train      : {X_train.shape}")
print(f"Validation : {X_validation.shape}")


# ---------------------------------------------------------
# 7. TRAIN MODEL
# ---------------------------------------------------------

print("\n[7/7] Training Ridge regression model...")

model = Ridge(
    alpha=10.0,
    solver="lsqr",
)

model.fit(X_train, y_train)


# ---------------------------------------------------------
# PREDICTIONS
# ---------------------------------------------------------

print("\nGenerating predictions...")

train_predictions = model.predict(X_train)
validation_predictions = model.predict(X_validation)

# Product score must remain between 0 and 100.

train_predictions = np.clip(
    train_predictions,
    0,
    100,
)

validation_predictions = np.clip(
    validation_predictions,
    0,
    100,
)


# ---------------------------------------------------------
# METRICS
# ---------------------------------------------------------

train_mae = mean_absolute_error(
    y_train,
    train_predictions,
)

train_rmse = np.sqrt(
    mean_squared_error(
        y_train,
        train_predictions,
    )
)

train_r2 = r2_score(
    y_train,
    train_predictions,
)


validation_mae = mean_absolute_error(
    y_validation,
    validation_predictions,
)

validation_rmse = np.sqrt(
    mean_squared_error(
        y_validation,
        validation_predictions,
    )
)

validation_r2 = r2_score(
    y_validation,
    validation_predictions,
)


# ---------------------------------------------------------
# RESULTS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("MODEL PERFORMANCE")
print("=" * 70)

print("\nTRAINING")
print("-" * 70)

print(f"MAE  : {train_mae:.4f}")
print(f"RMSE : {train_rmse:.4f}")
print(f"R²   : {train_r2:.4f}")


print("\nVALIDATION")
print("-" * 70)

print(f"MAE  : {validation_mae:.4f}")
print(f"RMSE : {validation_rmse:.4f}")
print(f"R²   : {validation_r2:.4f}")


# ---------------------------------------------------------
# SAMPLE PREDICTIONS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("SAMPLE VALIDATION PREDICTIONS")
print("=" * 70)

for actual, predicted in zip(
    y_validation[:15],
    validation_predictions[:15],
):
    error = abs(actual - predicted)

    print(
        f"Actual: {actual:6.2f} | "
        f"Predicted: {predicted:6.2f} | "
        f"Error: {error:6.2f}"
    )


# ---------------------------------------------------------
# SAVE MODEL + SCALER
# ---------------------------------------------------------

joblib.dump(
    model,
    MODEL_FILE,
)

joblib.dump(
    scaler,
    SCALER_FILE,
)


print("\n")
print("=" * 70)
print("MODEL SAVED")
print("=" * 70)

print(f"\nModel  : {MODEL_FILE}")
print(f"Scaler : {SCALER_FILE}")

print("\nTraining complete!")