
from app.services.esco_loader import load_esco_data


def main():
    print("Loading ESCO dataset...")

    data = load_esco_data()

    print("\n--- DATASET STATISTICS ---")

    for key, value in data["statistics"].items():
        print(f"{key}: {value}")

    print("\n--- SAMPLE OCCUPATIONS ---")

    for occupation in list(data["occupations"].values())[:5]:
        print(f"\nOccupation: {occupation['label']}")
        print(f"ESCO URI: {occupation['uri']}")
        print(
            "Essential skills:",
            len(occupation["essential_skills"])
        )
        print(
            "Optional skills:",
            len(occupation["optional_skills"])
        )

        for skill in occupation["essential_skills"][:3]:
            print(f"  - {skill['label']} ({skill['skill_type']})")

    print("\nESCO DATASET LOADED SUCCESSFULLY")


if __name__ == "__main__":
    main()
