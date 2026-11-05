import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from scipy.sparse import hstack, csr_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from xgboost import XGBRegressor


# ============================================================
# PATHS
# ============================================================

DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

TRAIN_FILE = DATA_DIR / "train_prepared.csv"
VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"

TRAIN_MATCHING = DATA_DIR / "train_matching_features.npy"
VALIDATION_MATCHING = DATA_DIR / "validation_matching_features.npy"

VECTORIZER_FILE = MODEL_DIR / "resume_job_tfidf_vectorizer.joblib"

MODEL_FILE = MODEL_DIR / "final_suitability_model.joblib"
SCALER_FILE = MODEL_DIR / "final_matching_scaler.joblib"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("TRAINING FINAL RESUME-JOB SUITABILITY MODEL")
print("=" * 70)

train_df = pd.read_csv(TRAIN_FILE)
validation_df = pd.read_csv(VALIDATION_FILE)

vectorizer = joblib.load(VECTORIZER_FILE)

train_matching = np.load(TRAIN_MATCHING)
validation_matching = np.load(VALIDATION_MATCHING)

y_train = train_df["ats_score"].to_numpy()
y_validation = validation_df["ats_score"].to_numpy()


print("\nTraining samples:", len(train_df))
print("Validation samples:", len(validation_df))
print("Matching features:", train_matching.shape[1])


# ============================================================
# CLEAN TEXT
# ============================================================

def clean_text(text):
    text = str(text).lower()
    return " ".join(text.split())


train_resume = train_df["resume_text"].apply(clean_text)
train_job = train_df["job_text"].apply(clean_text)

validation_resume = validation_df["resume_text"].apply(clean_text)
validation_job = validation_df["job_text"].apply(clean_text)


# ============================================================
# TF-IDF FEATURES
# ============================================================

print("\nBuilding TF-IDF features...")

train_resume_tfidf = vectorizer.transform(train_resume)
train_job_tfidf = vectorizer.transform(train_job)

validation_resume_tfidf = vectorizer.transform(validation_resume)
validation_job_tfidf = vectorizer.transform(validation_job)


# ============================================================
# SCALE MATCHING FEATURES
# ============================================================

print("Scaling matching features...")

scaler = StandardScaler()

train_matching_scaled = scaler.fit_transform(train_matching)
validation_matching_scaled = scaler.transform(validation_matching)


# Convert to sparse matrices
train_matching_sparse = csr_matrix(train_matching_scaled)
validation_matching_sparse = csr_matrix(validation_matching_scaled)


# ============================================================
# COMBINE ALL FEATURES
# ============================================================

print("Combining feature sets...")

X_train = hstack(
    [
        train_resume_tfidf,
        train_job_tfidf,
        train_matching_sparse,
    ],
    format="csr",
)

X_validation = hstack(
    [
        validation_resume_tfidf,
        validation_job_tfidf,
        validation_matching_sparse,
    ],
    format="csr",
)


print("\nFinal training feature shape:")
print(X_train.shape)

print("Final validation feature shape:")
print(X_validation.shape)


# ============================================================
# TRAIN XGBOOST
# ============================================================

print("\nTraining XGBoost...")

model = XGBRegressor(
    objective="reg:squarederror",

    n_estimators=700,
    max_depth=6,
    learning_rate=0.03,

    subsample=0.85,
    colsample_bytree=0.70,

    min_child_weight=5,

    reg_alpha=0.2,
    reg_lambda=3.0,

    gamma=0.05,

    random_state=42,

    n_jobs=-1,

    tree_method="hist",
)


model.fit(
    X_train,
    y_train,
)


# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

train_predictions = np.clip(
    model.predict(X_train),
    0,
    100,
)

validation_predictions = np.clip(
    model.predict(X_validation),
    0,
    100,
)


# ============================================================
# EVALUATION FUNCTION
# ============================================================

def evaluate_model(name, actual, predicted):

    mae = mean_absolute_error(actual, predicted)

    rmse = np.sqrt(
        mean_squared_error(actual, predicted)
    )

    r2 = r2_score(actual, predicted)

    print(f"\n{name}")
    print("-" * 70)

    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²:   {r2:.4f}")

    return mae, rmse, r2


# ============================================================
# EVALUATE
# ============================================================

train_mae, train_rmse, train_r2 = evaluate_model(
    "TRAINING PERFORMANCE",
    y_train,
    train_predictions,
)

validation_mae, validation_rmse, validation_r2 = evaluate_model(
    "VALIDATION PERFORMANCE",
    y_validation,
    validation_predictions,
)


# ============================================================
# SCORE BAND ACCURACY
# ============================================================

def get_band(score):

    if score < 40:
        return "LOW"

    if score < 70:
        return "MEDIUM"

    return "HIGH"


actual_bands = np.array(
    [get_band(x) for x in y_validation]
)

predicted_bands = np.array(
    [get_band(x) for x in validation_predictions]
)

band_accuracy = np.mean(
    actual_bands == predicted_bands
)


print("\n" + "=" * 70)
print("VALIDATION SCORE-BAND ACCURACY")
print("=" * 70)

print(f"Band Accuracy: {band_accuracy * 100:.2f}%")


# ============================================================
# PREDICTION DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("VALIDATION PREDICTION DISTRIBUTION")
print("=" * 70)

print(
    f"Actual Mean:    {y_validation.mean():.2f}"
)

print(
    f"Predicted Mean: {validation_predictions.mean():.2f}"
)

print(
    f"Actual Std:     {y_validation.std():.2f}"
)

print(
    f"Predicted Std:  {validation_predictions.std():.2f}"
)

print(
    f"Actual Min:     {y_validation.min():.2f}"
)

print(
    f"Predicted Min:  {validation_predictions.min():.2f}"
)

print(
    f"Actual Max:     {y_validation.max():.2f}"
)

print(
    f"Predicted Max:  {validation_predictions.max():.2f}"
)


# ============================================================
# SAVE MODEL
# ============================================================

print("\nSaving final model...")

joblib.dump(
    model,
    MODEL_FILE,
)

joblib.dump(
    scaler,
    SCALER_FILE,
)


print("\nModel saved:")
print(MODEL_FILE)

print("\nScaler saved:")
print(SCALER_FILE)


# ============================================================
# SAMPLE PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("SAMPLE VALIDATION PREDICTIONS")
print("=" * 70)

for i in range(min(15, len(y_validation))):

    print(
        f"Actual: {y_validation[i]:6.2f} "
        f"-> Predicted: {validation_predictions[i]:6.2f}"
    )


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("FINAL MODEL TRAINING COMPLETE")
print("=" * 70)