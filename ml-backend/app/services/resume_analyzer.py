import re
from functools import lru_cache

from transformers import pipeline
from app.services.skill_matcher import extract_skills
from app.services.technical_skills import extract_technical_skills

MODEL_NAME = "oksomu/resume-ner"


@lru_cache(maxsize=1)
def get_resume_model():
    return pipeline(
        "token-classification",
        model=MODEL_NAME,
        aggregation_strategy="simple",
        device=-1,
    )


def clean_entity(value):
    return re.sub(r"\s+", " ", str(value)).strip(" \t\r\n,;:|")


def normalize_email(text):
    match = re.search(
        r"[\w.+%-]+\s*@\s*[\w.-]+\s*\.\s*[A-Za-z]{2,}",
        text,
    )
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(0))


def normalize_text(text):
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n+", "\n", text)
    return text.strip()


def get_section(text, heading, next_headings):
    stops = "|".join(re.escape(x) for x in next_headings)

    pattern = (
        rf"(?is)\b{re.escape(heading)}\b"
        rf"\s*[:\-]?\s*(.*?)"
        rf"(?=\b(?:{stops})\b|$)"
    )

    match = re.search(pattern, text)

    return match.group(1).strip() if match else ""


MONTH = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
    r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
    r"Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
)

DATE_RANGE = re.compile(
    rf"\b{MONTH}\s+\d{{4}}\s*[-–—]\s*"
    rf"(?:{MONTH}\s+\d{{4}}|Present|Current)\b",
    re.I,
)


def extract_education(text):
    block = get_section(
        text,
        "EDUCATION",
        [
            "EXPERIENCE",
            "PROFESSIONAL EXPERIENCE",
            "PROJECTS",
            "TECHNICAL SKILLS",
            "CERTIFICATIONS",
        ],
    )

    if not block:
        return {
            "degrees": [],
            "institutions": [],
            "dates": [],
            "cgpa": [],
        }

    degree_pattern = re.compile(
        r"\b(?:B\.?\s?Tech|B\.?\s?E\.?|B\.?\s?Sc\.?|"
        r"M\.?\s?Tech|M\.?\s?E\.?|M\.?\s?Sc\.?|"
        r"M\.?\s?B\.?\s?A\.?|Ph\.?\s?D\.?|"
        r"Bachelor(?:'s)?|Master(?:'s)?|Diploma)\b"
        r"[^|\n]{0,120}",
        re.I,
    )

    degrees = [
        clean_entity(x)
        for x in degree_pattern.findall(block)
    ]

    institution_pattern = re.compile(
        r"[A-Z][A-Za-z&.,'()\- ]{2,100}"
        r"(?:University|Institute|College|School|Academy)"
        r"(?:[,\- ][A-Za-z&.,'()\- ]{2,80})?",
        re.I,
    )

    institutions = [
        clean_entity(x)
        for x in institution_pattern.findall(block)
    ]

    dates = [
        clean_entity(x)
        for x in DATE_RANGE.findall(block)
    ]

    cgpa = re.findall(
        r"(?:CGPA|GPA)\s*[:\-]?\s*[\d.]+\s*(?:/\s*\d+(?:\.\d+)?)?",
        block,
        re.I,
    )

    return {
        "degrees": list(dict.fromkeys(degrees)),
        "institutions": list(dict.fromkeys(institutions)),
        "dates": list(dict.fromkeys(dates)),
        "cgpa": list(dict.fromkeys(cgpa)),
    }


def extract_experience(sections=None, full_text=None, entities=None):
    # Support older calls: extract_experience(text)
    # and extract_experience(sections, entities).
    if isinstance(sections, str):
        if full_text is None:
            full_text = sections
        sections = None

    if isinstance(full_text, dict) and entities is None:
        entities = full_text
        full_text = None

    if full_text is None:
        if isinstance(sections, dict):
            full_text = "\n".join(sections.get("experience", []))
        else:
            full_text = ""

    if entities is None:
        entities = {}
    # Locate the actual uppercase EXPERIENCE heading.
    # Do not match the word "experience" in the summary.
    heading = re.search(
        r"(?m)^[ \t]*EXPERIENCE[ \t]*$",
        full_text
    )

    if heading:
        start = heading.end()
        remaining = full_text[start:]

        next_heading = re.search(
            r"(?m)^[ \t]*(?:EDUCATION|PROJECTS|TECHNICAL SKILLS|"
            r"SKILLS|CERTIFICATIONS|ACHIEVEMENTS)[ \t]*$",
            remaining
        )

        block = (
            remaining[:next_heading.start()]
            if next_heading
            else remaining
        )
    else:
        # Fallback: search for the known employment records.
        block = full_text

    # Match dates only when they are employment date ranges.
    month = (
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
        r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
        r"Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
    )

    date_pattern = re.compile(
        rf"\b{month}\s+\d{{4}}\s*[-–—]\s*"
        rf"(?:{month}\s+\d{{4}}|Present|Current)\b",
        re.I
    )

    lines = [
        re.sub(r"^[\s•●▪\-–—*]+", "", line).strip()
        for line in block.splitlines()
        if line.strip()
    ]

    titles = []
    companies = []
    dates = []
    responsibilities = []

    for index, line in enumerate(lines):
        match = date_pattern.search(line)

        if match:
            date_value = match.group(0).strip()
            dates.append(date_value)

            role = line[:match.start()].strip(" |,:-–—")

            # If the date is on its own line, use the preceding line.
            if not role and index > 0:
                previous = lines[index - 1]

                if not date_pattern.search(previous):
                    role = previous.strip(" |,:-–—")

            if role:
                titles.append(role)

            # Employer is normally the next line after the role/date.
            if index + 1 < len(lines):
                candidate = lines[index + 1].strip()

                if (
                    candidate
                    and not date_pattern.search(candidate)
                    and not candidate.startswith(("•", "-", "*"))
                    and not re.match(
                        r"^(develop|manage|build|create|coordinate|"
                        r"maintain|clean|analyze|collaborate|design|"
                        r"annotate|document)\b",
                        candidate,
                        re.I
                    )
                ):
                    companies.append(candidate)

        elif re.match(
            r"^(develop|manage|build|create|coordinate|maintain|"
            r"clean|analyze|collaborate|design|annotate|document)\b",
            line,
            re.I
        ):
            responsibilities.append(line)

    return {
        "job_titles": list(dict.fromkeys(titles)),
        "companies": list(dict.fromkeys(companies)),
        "dates": list(dict.fromkeys(dates)),
        "responsibilities": list(dict.fromkeys(responsibilities)),
    }


def analyze_resume(resume_text: str) -> dict:
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    text = normalize_text(resume_text)

    predictions = get_resume_model()(text)
    entities = {}

    for item in predictions:
        label = item.get("entity_group", "UNKNOWN")
        value = clean_entity(item.get("word", ""))

        if value:
            entities.setdefault(label, [])
            if value not in entities[label]:
                entities[label].append(value)

    education = extract_education(text)
    experience = extract_experience(text)

    esco_results = extract_skills(text)
    technical_results = extract_technical_skills(text)

    phones = re.findall(
        r"(?:\+?\d[\d\s().-]{7,}\d)",
        text,
    )

    return {
        "model": MODEL_NAME,
        "entities": entities,
        "contact": {
            "email": normalize_email(text),
            "phone": list(dict.fromkeys(phones))[:5],
            "location": entities.get("LOCATION", []),
        },
        "education": education,
        "experience": experience,
        "skills": {
            "ner_extracted": entities.get("SKILL", []),
            "esco": esco_results,
            "technical": technical_results,
        },
        "statistics": {
            "ner_entity_count": sum(
                len(values) for values in entities.values()
            ),
            "esco_skill_count": len(esco_results),
            "technical_skill_count": len(technical_results),
        },
    }




