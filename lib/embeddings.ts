import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 384;

export async function generateResumeEmbedding(text: string) {
  if (!text.trim()) {
    throw new Error("Cannot generate embedding from empty text.");
  }

  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      openai: {
        dimensions: EMBEDDING_DIMENSIONS,
      },
    },
  });

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, received ${embedding.length}.`
    );
  }

  return {
    embedding,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
} 