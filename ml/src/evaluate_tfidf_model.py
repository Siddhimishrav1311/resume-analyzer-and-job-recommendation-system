import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from scipy.stats import pearsonr


DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"
VALIDATION_FEATURES = DATA_DIR / "validation_engineered_features.npy"

MODEL_FILE = MODEL_DIR / "tfidf_ridge_model.joblib"
SCALER_FILE = MODEL_DIR / "engineered_feature_scaler.joblib"


print("=" * 70)
print("EVALUATING TF-IDF JOB SUITABILITY MODEL")
print("=" * 70)


# ---------------------------------------------------------
# 1. LOAD VALIDATION DATA
# ---------------------------------------------------------

print("\n[1/6] Loading validation data...")

df = pd.read_csv(VALIDATION_FILE)

y_actual = df["ats_score"].to_numpy()

print(f"Validation rows: {len(df)}")


# ---------------------------------------------------------
# 2. LOAD ENGINEERED FEATURES
# ---------------------------------------------------------

print("\n[2/6] Loading engineered validation features...")

X_engineered = np.load(VALIDATION_FEATURES)

print(f"Feature shape: {X_engineered.shape}")


# ---------------------------------------------------------
# 3. LOAD MODEL
# ---------------------------------------------------------

print("\n[3/6] Loading trained model...")

model = joblib.load(MODEL_FILE)
scaler = joblib.load(SCALER_FILE)

print("Model loaded successfully.")


# ---------------------------------------------------------
# IMPORTANT
# ---------------------------------------------------------
#
# The trained model expects:
#
# Resume TF-IDF
# + Job TF-IDF
# + Scaled engineered features
#
# Therefore we rebuild the exact same feature matrix.
# ---------------------------------------------------------

print("\n[4/6] Rebuilding validation feature matrix...")

vectorizer = joblib.load(
    MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"
)


def clean_text(text):
    text = str(text).lower()
    return " ".join(text.split())


resume_text = df["resume_text"].apply(clean_text)
job_text = df["job_text"].apply(clean_text)

resume_tfidf = vectorizer.transform(resume_text)
job_tfidf = vectorizer.transform(job_text)

engineered_scaled = scaler.transform(
    X_engineered
)

from scipy.sparse import hstack, csr_matrix

X_validation = hstack(
    [
        resume_tfidf,
        job_tfidf,
        csr_matrix(engineered_scaled),
    ],
    format="csr",
)

print(f"Final validation shape: {X_validation.shape}")


# ---------------------------------------------------------
# 5. GENERATE PREDICTIONS
# ---------------------------------------------------------

print("\n[5/6] Generating predictions...")

y_pred = model.predict(X_validation)

y_pred = np.clip(
    y_pred,
    0,
    100,
)


# ---------------------------------------------------------
# OVERALL METRICS
# ---------------------------------------------------------

mae = mean_absolute_error(
    y_actual,
    y_pred,
)

rmse = np.sqrt(
    mean_squared_error(
        y_actual,
        y_pred,
    )
)

r2 = r2_score(
    y_actual,
    y_pred,
)

correlation, p_value = pearsonr(
    y_actual,
    y_pred,
)


print("\n")
print("=" * 70)
print("OVERALL MODEL PERFORMANCE")
print("=" * 70)

print(f"\nMAE         : {mae:.4f}")
print(f"RMSE        : {rmse:.4f}")
print(f"R²          : {r2:.4f}")
print(f"Correlation : {correlation:.4f}")


# ---------------------------------------------------------
# SCORE RANGE ANALYSIS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("PERFORMANCE BY SCORE RANGE")
print("=" * 70)


def evaluate_range(name, mask):
    actual = y_actual[mask]
    predicted = y_pred[mask]

    if len(actual) == 0:
        return

    range_mae = mean_absolute_error(
        actual,
        predicted,
    )

    range_rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted,
        )
    )

    print(
        f"\n{name}"
    )

    print(
        f"Samples : {len(actual)}"
    )

    print(
        f"MAE     : {range_mae:.4f}"
    )

    print(
        f"RMSE    : {range_rmse:.4f}"
    )


evaluate_range(
    "LOW FIT (0-39)",
    y_actual < 40,
)

evaluate_range(
    "MEDIUM FIT (40-69)",
    (y_actual >= 40) & (y_actual < 70),
)

evaluate_range(
    "HIGH FIT (70-100)",
    y_actual >= 70,
)


# ---------------------------------------------------------
# DATASET LABEL ANALYSIS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("PERFORMANCE BY ORIGINAL DATASET LABEL")
print("=" * 70)


for label in [
    "No Fit",
    "Potential Fit",
    "Good Fit",
]:

    mask = df["original_label"] == label

    actual = y_actual[mask]
    predicted = y_pred[mask]

    if len(actual) == 0:
        continue

    label_mae = mean_absolute_error(
        actual,
        predicted,
    )

    label_rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted,
        )
    )

    print(
        f"\n{label}"
    )

    print(
        f"Samples : {len(actual)}"
    )

    print(
        f"Actual Mean    : {actual.mean():.2f}"
    )

    print(
        f"Predicted Mean : {predicted.mean():.2f}"
    )

    print(
        f"MAE            : {label_mae:.4f}"
    )

    print(
        f"RMSE           : {label_rmse:.4f}"
    )


# ---------------------------------------------------------
# PREDICTION DISTRIBUTION
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("PREDICTION DISTRIBUTION")
print("=" * 70)

print(
    f"\nActual score mean     : {y_actual.mean():.2f}"
)

print(
    f"Predicted score mean  : {y_pred.mean():.2f}"
)

print(
    f"Actual score std      : {y_actual.std():.2f}"
)

print(
    f"Predicted score std   : {y_pred.std():.2f}"
)

print(
    f"Actual minimum        : {y_actual.min():.2f}"
)

print(
    f"Predicted minimum     : {y_pred.min():.2f}"
)

print(
    f"Actual maximum        : {y_actual.max():.2f}"
)

print(
    f"Predicted maximum     : {y_pred.max():.2f}"
)


# ---------------------------------------------------------
# LARGEST ERRORS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("LARGEST PREDICTION ERRORS")
print("=" * 70)

errors = np.abs(
    y_actual - y_pred
)

largest_indices = np.argsort(
    errors
)[-15:][::-1]


for index in largest_indices:

    print(
        f"\nActual: {y_actual[index]:6.2f} | "
        f"Predicted: {y_pred[index]:6.2f} | "
        f"Error: {errors[index]:6.2f} | "
        f"Label: {df.iloc[index]['original_label']}"
    )


# ---------------------------------------------------------
# SCORE BAND CONFUSION
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("SCORE BAND AGREEMENT")
print("=" * 70)


def score_band(score):

    if score < 40:
        return "LOW"

    if score < 70:
        return "MEDIUM"

    return "HIGH"


actual_bands = np.array(
    [score_band(x) for x in y_actual]
)

predicted_bands = np.array(
    [score_band(x) for x in y_pred]
)

band_accuracy = np.mean(
    actual_bands == predicted_bands
)

print(
    f"\nScore-band accuracy: {band_accuracy:.4f}"
)

print(
    f"Score-band accuracy: {band_accuracy * 100:.2f}%"
)


# ---------------------------------------------------------
# FINAL SUMMARY
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("MODEL AUDIT COMPLETE")
print("=" * 70)

print(
    "\nThe model has been evaluated across:"
)

print("- Overall regression performance")
print("- Low / medium / high suitability")
print("- Original dataset labels")
print("- Prediction distribution")
print("- Largest errors")
print("- Score-band agreement")

print("\nNext step: use these results to design the stronger hybrid model.")