import numpy as np
import pandas as pd
import joblib

from pathlib import Path
from xgboost import XGBRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

TRAIN_FEATURES = DATA_DIR / "train_matching_features.npy"
VALIDATION_FEATURES = DATA_DIR / "validation_matching_features.npy"

TRAIN_FILE = DATA_DIR / "train_prepared.csv"
VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"

MODEL_FILE = MODEL_DIR / "xgboost_matching_model.joblib"


print("=" * 70)
print("TRAINING XGBOOST RESUME-JOB SUITABILITY MODEL")
print("=" * 70)


# ---------------------------------------------------------
# 1. LOAD DATA
# ---------------------------------------------------------

print("\n[1/6] Loading datasets...")

train_df = pd.read_csv(TRAIN_FILE)
validation_df = pd.read_csv(VALIDATION_FILE)

X_train = np.load(TRAIN_FEATURES)
X_validation = np.load(VALIDATION_FEATURES)

y_train = train_df["ats_score"].to_numpy()
y_validation = validation_df["ats_score"].to_numpy()

print(f"Training rows   : {len(train_df)}")
print(f"Validation rows : {len(validation_df)}")

print(f"Training features   : {X_train.shape}")
print(f"Validation features : {X_validation.shape}")


# ---------------------------------------------------------
# 2. FEATURE NAMES
# ---------------------------------------------------------

feature_names = [
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


# ---------------------------------------------------------
# 3. TRAIN XGBOOST
# ---------------------------------------------------------

print("\n[2/6] Training XGBoost model...")

model = XGBRegressor(
    objective="reg:squarederror",

    n_estimators=500,

    max_depth=5,

    learning_rate=0.03,

    subsample=0.85,

    colsample_bytree=0.85,

    min_child_weight=5,

    reg_alpha=0.1,

    reg_lambda=2.0,

    random_state=42,

    n_jobs=-1,
)


model.fit(
    X_train,
    y_train,
)


# ---------------------------------------------------------
# 4. PREDICTIONS
# ---------------------------------------------------------

print("\n[3/6] Generating predictions...")

train_predictions = model.predict(
    X_train
)

validation_predictions = model.predict(
    X_validation
)


# Keep product score inside 0–100.

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
# 5. METRICS
# ---------------------------------------------------------

print("\n[4/6] Calculating metrics...")


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
# 6. RESULTS
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("XGBOOST MODEL PERFORMANCE")
print("=" * 70)


print("\nTRAINING")
print("-" * 70)

print(
    f"MAE  : {train_mae:.4f}"
)

print(
    f"RMSE : {train_rmse:.4f}"
)

print(
    f"R²   : {train_r2:.4f}"
)


print("\nVALIDATION")
print("-" * 70)

print(
    f"MAE  : {validation_mae:.4f}"
)

print(
    f"RMSE : {validation_rmse:.4f}"
)

print(
    f"R²   : {validation_r2:.4f}"
)


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

    error = abs(
        actual - predicted
    )

    print(
        f"Actual: {actual:6.2f} | "
        f"Predicted: {predicted:6.2f} | "
        f"Error: {error:6.2f}"
    )


# ---------------------------------------------------------
# FEATURE IMPORTANCE
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)


importance = model.feature_importances_

importance_indices = np.argsort(
    importance
)[::-1]


for index in importance_indices:

    print(
        f"{feature_names[index]:30s} "
        f"{importance[index]:.6f}"
    )


# ---------------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------------

print("\n")
print("=" * 70)
print("SAVING MODEL")
print("=" * 70)


joblib.dump(
    model,
    MODEL_FILE,
)


print(
    f"\nModel saved to:"
)

print(
    MODEL_FILE
)


print("\n")
print("=" * 70)
print("XGBOOST TRAINING COMPLETE")
print("=" * 70)