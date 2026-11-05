import pandas as pd
from pathlib import Path

DATA_DIR = Path("ml/data")

train_path = DATA_DIR / "train.csv"
validation_path = DATA_DIR / "validation.csv"

train = pd.read_csv(train_path)
validation = pd.read_csv(validation_path)

print("=" * 60)
print("DATASET AUDIT")
print("=" * 60)

for name, df in [("TRAIN", train), ("VALIDATION", validation)]:

    print(f"\n{name}")
    print("-" * 60)

    print("Shape:", df.shape)
    print("Columns:", df.columns.tolist())

    print("\nMissing values:")
    print(df.isna().sum())

    print("\nDuplicate rows:", df.duplicated().sum())
    print("Duplicate text:", df["text"].duplicated().sum())

    print("\nATS score statistics:")
    print(df["ats_score"].describe())

    print("\nOriginal label distribution:")
    print(df["original_label"].value_counts())

    print("\nOriginal label percentage:")
    print(
        (df["original_label"].value_counts(normalize=True) * 100)
        .round(2)
    )

    df["text_length"] = df["text"].astype(str).str.len()

    print("\nText length statistics:")
    print(df["text_length"].describe())


print("\n" + "=" * 60)
print("TRAIN / VALIDATION TEXT OVERLAP")
print("=" * 60)

train_texts = set(train["text"].astype(str))
validation_texts = set(validation["text"].astype(str))

overlap = train_texts.intersection(validation_texts)

print("Exact duplicate texts across splits:", len(overlap))


print("\n" + "=" * 60)
print("SAMPLE SCORES")
print("=" * 60)

print(
    train[["ats_score", "original_label"]]
    .head(10)
    .to_string(index=False)
)