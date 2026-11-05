import numpy as np
import joblib

from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

TRAIN_FEATURES = DATA_DIR / "train_engineered_features.npy"
VALIDATION_FEATURES = DATA_DIR / "validation_engineered_features.npy"

TRAIN_TARGETS = DATA_DIR / "train_targets.npy"
VALIDATION_TARGETS = DATA_DIR / "validation_targets.npy"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


print("=" * 60)
print("TRAINING BASELINE ATS MODEL")
print("=" * 60)


# ---------------------------------------------------------
# Load features
# ---------------------------------------------------------

X_train = np.load(TRAIN_FEATURES)
X_validation = np.load(VALIDATION_FEATURES)

y_train = np.load(TRAIN_TARGETS)
y_validation = np.load(VALIDATION_TARGETS)

print("\nTraining feature shape:", X_train.shape)
print("Validation feature shape:", X_validation.shape)

print("Training target shape:", y_train.shape)
print("Validation target shape:", y_validation.shape)


# ---------------------------------------------------------
# Train Ridge Regression
# ---------------------------------------------------------

print("\nTraining Ridge Regression...")

model = Ridge(alpha=10.0)

model.fit(
    X_train,
    y_train
)


# ---------------------------------------------------------
# Predictions
# ---------------------------------------------------------

train_predictions = model.predict(X_train)

validation_predictions = model.predict(
    X_validation
)


# ---------------------------------------------------------
# Keep predictions inside score range
# ---------------------------------------------------------

train_predictions = np.clip(
    train_predictions,
    0,
    100
)

validation_predictions = np.clip(
    validation_predictions,
    0,
    100
)


# ---------------------------------------------------------
# Training metrics
# ---------------------------------------------------------

train_mae = mean_absolute_error(
    y_train,
    train_predictions
)

train_rmse = np.sqrt(
    mean_squared_error(
        y_train,
        train_predictions
    )
)

train_r2 = r2_score(
    y_train,
    train_predictions
)


# ---------------------------------------------------------
# Validation metrics
# ---------------------------------------------------------

validation_mae = mean_absolute_error(
    y_validation,
    validation_predictions
)

validation_rmse = np.sqrt(
    mean_squared_error(
        y_validation,
        validation_predictions
    )
)

validation_r2 = r2_score(
    y_validation,
    validation_predictions
)


# ---------------------------------------------------------
# Results
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print("\nTRAINING")
print("-" * 60)

print(f"MAE  : {train_mae:.4f}")
print(f"RMSE : {train_rmse:.4f}")
print(f"R²   : {train_r2:.4f}")


print("\nVALIDATION")
print("-" * 60)

print(f"MAE  : {validation_mae:.4f}")
print(f"RMSE : {validation_rmse:.4f}")
print(f"R²   : {validation_r2:.4f}")


# ---------------------------------------------------------
# Show sample predictions
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("SAMPLE VALIDATION PREDICTIONS")
print("=" * 60)

for actual, predicted in zip(
    y_validation[:10],
    validation_predictions[:10]
):
    print(
        f"Actual: {actual:6.2f} | "
        f"Predicted: {predicted:6.2f} | "
        f"Error: {abs(actual - predicted):6.2f}"
    )


# ---------------------------------------------------------
# Save model
# ---------------------------------------------------------

model_path = MODEL_DIR / "baseline_ridge_model.joblib"

joblib.dump(
    model,
    model_path
)

print("\n" + "=" * 60)
print("MODEL SAVED")
print("=" * 60)

print(f"\nModel: {model_path}")