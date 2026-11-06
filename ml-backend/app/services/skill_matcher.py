
import re
from collections import defaultdict
from functools import lru_cache

from app.services.esco_loader import load_esco_data


def normalize_text(text: str) -> str:
    """Normalize text for case-insensitive phrase matching."""
    text = text.casefold()
    text = re.sub(r"[^a-z0-9+#.\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def build_skill_index(skills: dict) -> dict:
    """
    Build an ESCO index.

    Preferred labels are always retained.
    Alternative labels are retained only when they contain
    at least two words, reducing ambiguous matches.
    """
    preferred_index = defaultdict(list)
    alternative_index = defaultdict(list)

    for skill in skills.values():

        # Preferred labels have the highest matching priority.
        preferred = normalize_text(skill["label"])

        if len(preferred) >= 2:
            preferred_index[preferred].append(skill)

        # Ignore single-word alternative labels.
        for label in skill["alternative_labels"]:
            normalized = normalize_text(label)

            if len(normalized.split()) < 2:
                continue

            alternative_index[normalized].append(skill)

    # Preferred labels override alternative-label collisions.
    index = dict(preferred_index)

    for label, matching_skills in alternative_index.items():

        if label in index:
            continue

        unique_skills = {}
        for skill in matching_skills:
            unique_skills[skill["uri"]] = skill

        index[label] = list(unique_skills.values())

    return index


@lru_cache(maxsize=1)
def get_skill_index() -> dict:
    """Load and cache the ESCO skill index once."""
    data = load_esco_data()
    return build_skill_index(data["skills"])


def extract_skills(resume_text: str) -> list[dict]:
    """
    Extract ESCO skills using exact phrase matching.

    Longer phrases take priority over shorter overlapping matches.
    Preferred labels take priority over alternative labels.
    """

    if not resume_text or not resume_text.strip():
        return []

    skill_index = get_skill_index()
    normalized_resume = normalize_text(resume_text)

    candidates = []

    for label, matching_skills in skill_index.items():

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(label)
            + r"(?![a-z0-9])"
        )

        for match in re.finditer(pattern, normalized_resume):

            for skill in matching_skills:
                candidates.append({
                    "start": match.start(),
                    "end": match.end(),
                    "matched_label": label,
                    "skill": skill,
                })

    # Longer phrases first, then earlier positions.
    candidates.sort(
        key=lambda item: (
            -(item["end"] - item["start"]),
            item["start"],
        )
    )

    selected = []
    used_uris = set()
    occupied_spans = []

    for candidate in candidates:

        skill = candidate["skill"]
        uri = skill["uri"]

        if uri in used_uris:
            continue

        overlaps = any(
            candidate["start"] < end
            and candidate["end"] > start
            for start, end in occupied_spans
        )

        if overlaps:
            continue

        selected.append({
            "uri": uri,
            "label": skill["label"],
            "matched_label": candidate["matched_label"],
            "skill_type": skill["skill_type"],
            "description": skill["description"],
        })

        used_uris.add(uri)

        occupied_spans.append((
            candidate["start"],
            candidate["end"],
        ))

    selected.sort(key=lambda item: item["label"].casefold())

    return selected
