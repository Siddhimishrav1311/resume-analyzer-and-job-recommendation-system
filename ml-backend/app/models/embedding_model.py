from functools import lru_cache
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model():
    """Load the pretrained model once and reuse it."""
    return SentenceTransformer(MODEL_NAME, device="cpu")


def encode_texts(texts: list[str]) -> list[list[float]]:
    """Convert text into normalized semantic embeddings."""
    model = get_model()

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embeddings.tolist()