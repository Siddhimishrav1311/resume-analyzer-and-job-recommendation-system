from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

from app.models.embedding_model import (
    MODEL_NAME,
    encode_texts,
    get_model,
)

from app.services.resume_analyzer import analyze_resume


app = FastAPI(
    title="Resume Analyzer ML API",
    description="Resume NER, ESCO skills, technical skills and job similarity API",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmbeddingRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=64)


class SimilarityRequest(BaseModel):
    resume_text: str = Field(min_length=20, max_length=100000)
    job_descriptions: list[str] = Field(min_length=1, max_length=50)


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=30, max_length=100000)


@app.get("/")
def root():
    return {
        "message": "Resume Analyzer ML API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "embedding_model": MODEL_NAME,
        "model_loaded": get_model.cache_info().currsize > 0,
    }


@app.post("/analyze-resume")
def analyze_resume_endpoint(request: ResumeAnalysisRequest):
    try:
        result = analyze_resume(request.resume_text)

        return {
            "success": True,
            "analysis": result,
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(error)}",
        )


@app.post("/embeddings")
def create_embeddings(request: EmbeddingRequest):
    try:
        if any(not text.strip() for text in request.texts):
            raise HTTPException(
                status_code=400,
                detail="Texts cannot be empty.",
            )

        embeddings = encode_texts(request.texts)

        return {
            "model": MODEL_NAME,
            "dimensions": len(embeddings[0]),
            "embeddings": embeddings,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(error)}",
        )


@app.post("/similarity")
def calculate_similarity(request: SimilarityRequest):
    try:
        if not request.resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text cannot be empty.",
            )

        if any(not job.strip() for job in request.job_descriptions):
            raise HTTPException(
                status_code=400,
                detail="Job descriptions cannot be empty.",
            )

        texts = [request.resume_text, *request.job_descriptions]
        embeddings = np.array(encode_texts(texts))

        resume_embedding = embeddings[0]
        job_embeddings = embeddings[1:]

        scores = np.dot(job_embeddings, resume_embedding)

        results = [
            {
                "job_index": index,
                "similarity": round(float(score), 4),
                "similarity_percent": round(
                    max(0.0, min(1.0, float(score))) * 100,
                    2,
                ),
            }
            for index, score in enumerate(scores)
        ]

        results.sort(
            key=lambda item: item["similarity"],
            reverse=True,
        )

        return {
            "model": MODEL_NAME,
            "results": results,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Similarity calculation failed: {str(error)}",
        )
