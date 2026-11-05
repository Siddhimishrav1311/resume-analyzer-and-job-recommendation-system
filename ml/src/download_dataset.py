from datasets import load_dataset
from pathlib import Path

DATASET_NAME = "0xnbk/resume-ats-score-v1-en"

OUTPUT_DIR = Path("ml/data")

print("Loading dataset...")
dataset = load_dataset(DATASET_NAME)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for split_name in dataset:
    output_file = OUTPUT_DIR / f"{split_name}.csv"

    dataframe = dataset[split_name].to_pandas()
    dataframe.to_csv(output_file, index=False)

    print(f"\nSaved {split_name}:")
    print(f"Rows: {len(dataframe)}")
    print(f"File: {output_file}")

print("\nDataset saved successfully.")