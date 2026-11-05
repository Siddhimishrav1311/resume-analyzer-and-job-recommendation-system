import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from scipy.stats import pearsonr

DATA_DIR = Path("ml/data")
MODEL_DIR = Path("ml/models")

VALIDATION_FILE = DATA_DIR / "validation_prepared.csv"
VALIDATION_FEATURES = DATA_DIR / "validation_matching_features.npy"
MODEL_FILE = MODEL_DIR / "xgboost_matching_model.joblib"


print("=" * 70)
print("EVALUATING XGBOOST RESUME-JOB SUITABILITY MODEL")
print("=" * 70)


# ---------------------------------------------------------
# 1. LOAD VALIDATION DATA
# ---------------------------------------------------------

df = pd.read_csv(VALIDATION_FILE)

X = np.load(VALIDATION_FEATURES)

y_actual = df["ats_score"].to_numpy()

model = joblib.load(MODEL_FILE)

y_pred = np.clip(model.predict(X), 0, 100)


# ---------------------------------------------------------
# 2. OVERALL METRICS
# ---------------------------------------------------------

mae = mean_absolute_error(y_actual, y_pred)
rmse = np.sqrt(mean_squared_error(y_actual, y_pred))
r2 = r2_score(y_actual, y_pred)
correlation = pearsonr(y_actual, y_pred)[0]


print("\n" + "=" * 70)
print("OVERALL VALIDATION PERFORMANCE")
print("=" * 70)

print(f"Samples:       {len(y_actual)}")
print(f"MAE:           {mae:.4f}")
print(f"RMSE:          {rmse:.4f}")
print(f"R²:            {r2:.4f}")
print(f"Correlation:   {correlation:.4f}")


# ---------------------------------------------------------
# 3. SCORE RANGE PERFORMANCE
# ---------------------------------------------------------

def evaluate_range(name, mask):

    actual = y_actual[mask]
    predicted = y_pred[mask]

    if len(actual) == 0:
        return

    range_mae = mean_absolute_error(actual, predicted)
    range_rmse = np.sqrt(mean_squared_error(actual, predicted))

    print(f"\n{name}")
    print("-" * 70)
    print(f"Samples: {len(actual)}")
    print(f"MAE:     {range_mae:.4f}")
    print(f"RMSE:    {range_rmse:.4f}")


evaluate_range(
    "LOW FIT (0-39)",
    y_actual < 40
)

evaluate_range(
    "MEDIUM FIT (40-69)",
    (y_actual >= 40) & (y_actual < 70)
)

evaluate_range(
    "HIGH FIT (70-100)",
    y_actual >= 70
)


# ---------------------------------------------------------
# 4. ORIGINAL DATASET LABEL PERFORMANCE
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("PERFORMANCE BY ORIGINAL DATASET LABEL")
print("=" * 70)


for label in ["No Fit", "Potential Fit", "Good Fit"]:

    mask = df["original_label"] == label

    actual = y_actual[mask]
    predicted = y_pred[mask]

    label_mae = mean_absolute_error(actual, predicted)
    label_rmse = np.sqrt(mean_squared_error(actual, predicted))

    print(f"\n{label}")
    print("-" * 70)
    print(f"Samples:        {len(actual)}")
    print(f"Actual Mean:    {actual.mean():.2f}")
    print(f"Predicted Mean: {predicted.mean():.2f}")
    print(f"MAE:            {label_mae:.4f}")
    print(f"RMSE:           {label_rmse:.4f}")


# ---------------------------------------------------------
# 5. PREDICTION DISTRIBUTION
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("PREDICTION DISTRIBUTION")
print("=" * 70)

print(f"Actual Mean:       {y_actual.mean():.2f}")
print(f"Predicted Mean:    {y_pred.mean():.2f}")

print(f"Actual Std:        {y_actual.std():.2f}")
print(f"Predicted Std:     {y_pred.std():.2f}")

print(f"Actual Min:        {y_actual.min():.2f}")
print(f"Predicted Min:     {y_pred.min():.2f}")

print(f"Actual Max:        {y_actual.max():.2f}")
print(f"Predicted Max:     {y_pred.max():.2f}")


# ---------------------------------------------------------
# 6. LARGEST PREDICTION ERRORS
# ---------------------------------------------------------

errors = np.abs(y_actual - y_pred)

largest_indices = np.argsort(errors)[-10:][::-1]


print("\n" + "=" * 70)
print("LARGEST PREDICTION ERRORS")
print("=" * 70)

print("\nActual -> Predicted | Error")

for index in largest_indices:

    print(
        f"{y_actual[index]:6.2f} -> "
        f"{y_pred[index]:6.2f} | "
        f"{errors[index]:6.2f}"
    )


# ---------------------------------------------------------
# 7. SCORE-BAND ACCURACY
# ---------------------------------------------------------

def get_band(score):

    if score < 40:
        return "LOW"

    if score < 70:
        return "MEDIUM"

    return "HIGH"


actual_bands = np.array([
    get_band(score)
    for score in y_actual
])

predicted_bands = np.array([
    get_band(score)
    for score in y_pred
])


band_accuracy = np.mean(actual_bands == predicted_bands)


print("\n" + "=" * 70)
print("SCORE-BAND ACCURACY")
print("=" * 70)

print("LOW:    0-39")
print("MEDIUM: 40-69")
print("HIGH:   70-100")

print(f"\nBand Accuracy: {band_accuracy * 100:.2f}%")


# ---------------------------------------------------------
# 8. CONFUSION MATRIX FOR SCORE BANDS
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("SCORE-BAND CONFUSION MATRIX")
print("=" * 70)

bands = ["LOW", "MEDIUM", "HIGH"]

print("\nActual \\ Predicted")
print(f"{'':12} {'LOW':>10} {'MEDIUM':>10} {'HIGH':>10}")

for actual_band in bands:

    row = []

    for predicted_band in bands:

        count = np.sum(
            (actual_bands == actual_band)
            & (predicted_bands == predicted_band)
        )

        row.append(count)

    print(
        f"{actual_band:12}"
        f"{row[0]:10d}"
        f"{row[1]:10d}"
        f"{row[2]:10d}"
    )


# ---------------------------------------------------------
# 9. COMPARISON WITH PREVIOUS TF-IDF MODEL
# ---------------------------------------------------------

previous_mae = 18.4462
previous_rmse = 21.5726
previous_r2 = 0.2528


print("\n" + "=" * 70)
print("XGBOOST VS PREVIOUS TF-IDF MODEL")
print("=" * 70)

print("\nMetric        TF-IDF       XGBoost")

print(
    f"MAE           {previous_mae:8.4f}    {mae:8.4f}"
)

print(
    f"RMSE          {previous_rmse:8.4f}    {rmse:8.4f}"
)

print(
    f"R²            {previous_r2:8.4f}    {r2:8.4f}"
)

mae_improvement = previous_mae - mae
rmse_improvement = previous_rmse - rmse
r2_improvement = r2 - previous_r2


print("\nImprovement:")
print(f"MAE:  {mae_improvement:+.4f}")
print(f"RMSE: {rmse_improvement:+.4f}")
print(f"R²:   {r2_improvement:+.4f}")


print("\n" + "=" * 70)
print("XGBOOST EVALUATION COMPLETE")
print("=" * 70)