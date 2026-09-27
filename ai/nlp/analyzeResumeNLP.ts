import { preprocessResume } from "./preprocess";
import { extractResumeSections } from "./sectionExtractor";
import {
  extractSkills,
  type ExtractedSkill,
} from "./skillExtractor";
import {
  extractEntities,
  type ExtractedEntity,
} from "./entityExtractor";

export type ResumeNLPAnalysis = {
  originalText: string;
  cleanedText: string;

  wordCount: number;
  sentences: string[];
  words: string[];

  sections: {
    summary: string;
    skills: string;
    experience: string;
    education: string;
    projects: string;
    certifications: string;
    other: string;
  };

  skills: ExtractedSkill[];
  entities: ExtractedEntity[];
};

export function analyzeResumeNLP(
  resumeText: string
): ResumeNLPAnalysis {
  // Step 1: Preprocess the resume
  const preprocessing = preprocessResume(resumeText);

  // Step 2: Detect resume sections
  const sections = extractResumeSections(
    preprocessing.cleanedText
  );

  // Step 3: Extract skills
  const skills = extractSkills(
    preprocessing.cleanedText
  );

  // Step 4: Extract entities
  const entities = extractEntities(
    preprocessing.cleanedText
  );

  return {
    originalText: preprocessing.originalText,
    cleanedText: preprocessing.cleanedText,

    wordCount: preprocessing.wordCount,
    sentences: preprocessing.sentences,
    words: preprocessing.words,

    sections,

    skills,
    entities,
  };
}