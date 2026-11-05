import pandas as pd
from pathlib import Path

DATA_DIR = Path("ml/data")

TRAIN_INPUT = DATA_DIR / "train.csv"
VALIDATION_INPUT = DATA_DIR / "validation.csv"

TRAIN_OUTPUT = DATA_DIR / "train_prepared.csv"
VALIDATION_OUTPUT = DATA_DIR / "validation_prepared.csv"


def split_resume_and_job(text):
    text = str(text)

    separator = " SEP "

    if separator not in text:
        return text.strip(), ""

    resume, job = text.split(separator, 1)

    job = job.lstrip(" -:")

    return resume.strip(), job.strip()


def prepare_file(input_path, output_path):
    print(f"\nProcessing: {input_path}")

    df = pd.read_csv(input_path)

    split_data = df["text"].apply(split_resume_and_job)

    df["resume_text"] = split_data.apply(lambda x: x[0])
    df["job_text"] = split_data.apply(lambda x: x[1])

    prepared_df = df[
        [
            "resume_text",
            "job_text",
            "ats_score",
            "original_label",
        ]
    ]

    prepared_df.to_csv(output_path, index=False)

    print("Saved:", output_path)
    print("Rows:", len(prepared_df))
    print(
        "Empty resume texts:",
        (prepared_df["resume_text"].str.len() == 0).sum()
    )
    print(
        "Empty job texts:",
        (prepared_df["job_text"].str.len() == 0).sum()
    )


print("=" * 60)
print("PREPARING RESUME-JOB DATASET")
print("=" * 60)

prepare_file(TRAIN_INPUT, TRAIN_OUTPUT)
prepare_file(VALIDATION_INPUT, VALIDATION_OUTPUT)

print("\nDataset preparation complete.")