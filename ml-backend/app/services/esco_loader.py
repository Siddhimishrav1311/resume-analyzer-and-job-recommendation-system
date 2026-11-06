
import csv
import re
from functools import lru_cache
from pathlib import Path


MODEL_DATA_DIR = (
    Path(__file__).resolve().parents[2] / "data" / "esco"
)


def find_dataset_file(filename: str) -> Path:
    """Find a specific ESCO CSV file inside the extracted dataset."""
    matches = list(MODEL_DATA_DIR.rglob(filename))

    if not matches:
        raise FileNotFoundError(
            f"ESCO file not found: {filename}. "
            f"Expected location: {MODEL_DATA_DIR}"
        )

    return matches[0]


def read_csv(filename: str) -> list[dict]:
    """Read an ESCO CSV file using its original column headers."""
    path = find_dataset_file(filename)

    with path.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        return list(csv.DictReader(file))


def parse_labels(value: str | None) -> list[str]:
    """Convert ESCO alternative labels into a clean list."""
    if not value:
        return []

    return [
        label.strip()
        for label in re.split(r"[\r\n|]+", value)
        if label.strip()
    ]


@lru_cache(maxsize=1)
def load_esco_data() -> dict:
    """
    Load ESCO occupations, skills and occupation-skill relationships.

    Records are linked using their official ESCO concept URIs.
    """
    occupation_rows = read_csv("occupations_en.csv")
    skill_rows = read_csv("skills_en.csv")
    relation_rows = read_csv("occupationSkillRelations_en.csv")

    occupations = {}

    for row in occupation_rows:
        uri = row.get("conceptUri", "").strip()

        if not uri:
            continue

        occupations[uri] = {
            "uri": uri,
            "label": row.get("preferredLabel", "").strip(),
            "alternative_labels": parse_labels(
                row.get("altLabels")
            ),
            "description": row.get("description", "").strip(),
            "isco_group": row.get("iscoGroup", "").strip(),
            "code": row.get("code", "").strip(),
        }

    skills = {}

    for row in skill_rows:
        uri = row.get("conceptUri", "").strip()

        if not uri:
            continue

        skills[uri] = {
            "uri": uri,
            "label": row.get("preferredLabel", "").strip(),
            "alternative_labels": parse_labels(
                row.get("altLabels")
            ),
            "skill_type": row.get("skillType", "").strip(),
            "description": row.get("description", "").strip(),
        }

    for occupation in occupations.values():
        occupation["essential_skills"] = []
        occupation["optional_skills"] = []

    valid_relationships = 0
    skipped_relationships = 0

    for row in relation_rows:
        occupation_uri = row.get("occupationUri", "").strip()
        skill_uri = row.get("skillUri", "").strip()
        relation_type = row.get("relationType", "").strip()
        skill_type = row.get("skillType", "").strip()

        if (
            not occupation_uri
            or not skill_uri
            or not skill_type
            or relation_type not in ("essential", "optional")
            or occupation_uri not in occupations
            or skill_uri not in skills
        ):
            skipped_relationships += 1
            continue

        skill = skills[skill_uri]

        relationship = {
            "uri": skill["uri"],
            "label": skill["label"],
            "alternative_labels": skill["alternative_labels"],
            "skill_type": skill_type,
            "relation_type": relation_type,
        }

        target = (
            "essential_skills"
            if relation_type == "essential"
            else "optional_skills"
        )

        occupations[occupation_uri][target].append(relationship)
        valid_relationships += 1

    return {
        "version": "1.2.1",
        "occupations": occupations,
        "skills": skills,
        "statistics": {
            "occupation_count": len(occupations),
            "skill_count": len(skills),
            "valid_relationships": valid_relationships,
            "skipped_relationships": skipped_relationships,
        },
    }
