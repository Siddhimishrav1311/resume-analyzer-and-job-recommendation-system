import nlp from "compromise";

export type ExtractedEntity = {
  text: string;
  type:
    | "Person"
    | "Organization"
    | "Location"
    | "Date"
    | "Email"
    | "URL"
    | "Phone"
    | "Number";
  confidence: number;
};

function uniqueEntities(
  entities: ExtractedEntity[]
): ExtractedEntity[] {
  const seen = new Set<string>();

  return entities.filter((entity) => {
    const key = `${entity.type}:${entity.text.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function extractEmails(text: string): ExtractedEntity[] {
  const matches = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  );

  return (matches ?? []).map((email) => ({
    text: email,
    type: "Email",
    confidence: 0.99,
  }));
}

function extractURLs(text: string): ExtractedEntity[] {
  const matches = text.match(
    /(?:https?:\/\/|www\.)[^\s]+/gi
  );

  return (matches ?? []).map((url) => ({
    text: url.replace(/[),.;]+$/, ""),
    type: "URL",
    confidence: 0.99,
  }));
}

function extractPhones(text: string): ExtractedEntity[] {
  const matches = text.match(
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/g
  );

  return (matches ?? []).map((phone) => ({
    text: phone,
    type: "Phone",
    confidence: 0.98,
  }));
}

function extractDates(text: string): ExtractedEntity[] {
  const matches = text.match(
    /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi
  );

  return (matches ?? []).map((date) => ({
    text: date,
    type: "Date",
    confidence: 0.90,
  }));
}

export function extractEntities(
  resumeText: string
): ExtractedEntity[] {
  const doc = nlp(resumeText);

  const entities: ExtractedEntity[] = [];

  doc
    .people()
    .out("array")
    .forEach((person: unknown) => {
      entities.push({
        text: String(person).trim(),
        type: "Person",
        confidence: 0.90,
      });
    });

  doc
    .organizations()
    .out("array")
    .forEach((organization: unknown) => {
      entities.push({
        text: String(organization).trim(),
        type: "Organization",
        confidence: 0.85,
      });
    });

  doc
    .places()
    .out("array")
    .forEach((place: unknown) => {
      entities.push({
        text: String(place).trim(),
        type: "Location",
        confidence: 0.85,
      });
    });

  doc
    .numbers()
    .out("array")
    .forEach((number: unknown) => {
      entities.push({
        text: String(number).trim(),
        type: "Number",
        confidence: 0.80,
      });
    });

  entities.push(...extractDates(resumeText));
  entities.push(...extractEmails(resumeText));
  entities.push(...extractURLs(resumeText));
  entities.push(...extractPhones(resumeText));

  return uniqueEntities(
    entities.filter((entity) => entity.text.length > 0)
  );
}

export function groupEntitiesByType(
  resumeText: string
): Record<string, ExtractedEntity[]> {
  const entities = extractEntities(resumeText);

  return entities.reduce(
    (groups, entity) => {
      if (!groups[entity.type]) {
        groups[entity.type] = [];
      }

      groups[entity.type].push(entity);

      return groups;
    },
    {} as Record<string, ExtractedEntity[]>
  );
}