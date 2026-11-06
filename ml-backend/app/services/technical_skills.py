
import re


TECHNICAL_SKILLS = [
    {
        "id": "ros2",
        "label": "ROS 2",
        "aliases": ["ros2", "ros 2", "robot operating system 2"],
        "category": "robotics",
    },
    {
        "id": "gazebo",
        "label": "Gazebo",
        "aliases": ["gazebo simulator"],
        "category": "robotics simulation",
    },
    {
        "id": "solidworks",
        "label": "SolidWorks",
        "aliases": ["solid works"],
        "category": "CAD",
    },
    {
        "id": "px4",
        "label": "PX4",
        "aliases": ["px4 autopilot"],
        "category": "drone simulation",
    },
    {
        "id": "ardupilot",
        "label": "ArduPilot",
        "aliases": ["ardupilot autopilot"],
        "category": "drone simulation",
    },
    {
        "id": "moveit",
        "label": "MoveIt",
        "aliases": ["moveit 2"],
        "category": "robotics",
    },
    {
        "id": "rviz",
        "label": "RViz",
        "aliases": ["rviz2"],
        "category": "robotics visualization",
    },
    {
        "id": "fusion360",
        "label": "Fusion 360",
        "aliases": ["autodesk fusion 360"],
        "category": "CAD",
    },
    {
        "id": "blender",
        "label": "Blender",
        "aliases": ["blender 3d"],
        "category": "3D modelling",
    },
    {
        "id": "matlab",
        "label": "MATLAB",
        "aliases": [],
        "category": "engineering software",
    },
]


def extract_technical_skills(text: str) -> list[dict]:
    """Extract known technical skills using case-insensitive phrase matching."""

    if not text or not text.strip():
        return []

    results = []
    matched_skill_ids = set()

    # Search longer phrases first to avoid partial matches.
    candidates = []

    for skill in TECHNICAL_SKILLS:
        terms = [skill["label"]] + skill["aliases"]

        for term in terms:
            pattern = (
                r"(?<![A-Za-z0-9])"
                + re.escape(term)
                + r"(?![A-Za-z0-9])"
            )

            for match in re.finditer(pattern, text, re.IGNORECASE):
                candidates.append({
                    "start": match.start(),
                    "end": match.end(),
                    "skill": skill,
                    "matched_alias": match.group(),
                })

    candidates.sort(
        key=lambda item: (
            -(item["end"] - item["start"]),
            item["start"],
        )
    )

    occupied_positions = []

    for candidate in candidates:
        skill = candidate["skill"]

        if skill["id"] in matched_skill_ids:
            continue

        start = candidate["start"]
        end = candidate["end"]

        # Avoid overlapping matches.
        overlaps = any(
            start < existing_end and end > existing_start
            for existing_start, existing_end in occupied_positions
        )

        if overlaps:
            continue

        results.append({
            "id": skill["id"],
            "label": skill["label"],
            "category": skill["category"],
            "matched_alias": candidate["matched_alias"],
            "source": "technical_catalogue",
        })

        matched_skill_ids.add(skill["id"])
        occupied_positions.append((start, end))

    results.sort(key=lambda item: text.lower().find(
        item["matched_alias"].lower()
    ))

    return results
