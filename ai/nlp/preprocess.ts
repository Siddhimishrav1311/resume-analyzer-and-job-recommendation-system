import nlp from "compromise";

export type NLPResult = {
  originalText: string;
  cleanedText: string;
  sentences: string[];
  words: string[];
  wordCount: number;
};

export function preprocessResume(resumeText: string): NLPResult {
  const originalText = resumeText;

  // Normalize line breaks and whitespace
  const cleanedText = resumeText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Process the cleaned text with compromise NLP
  const doc = nlp(cleanedText);

  const sentences = doc.sentences().out("array");

  const words = doc
    .terms()
    .out("array")
    .map((word: unknown) => String(word).trim())
    .filter(Boolean);

  return {
    originalText,
    cleanedText,
    sentences,
    words,
    wordCount: words.length,
  };
}
