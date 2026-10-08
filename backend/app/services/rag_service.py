"""
RAG service: embeds queries via NVIDIA's embedding API and retrieves
the most relevant knowledge chunks from pgvector.

Design choices:
- 1024-dim embeddings from nvidia/nv-embedqa-e5-v5 (free tier)
- Cosine distance (<=> operator) for similarity search
- Top-k capped at 5 to keep LLM context bounded
"""
import logging
from openai import OpenAI
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy-initialised model (loads fast locally)
_model: SentenceTransformer | None = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model


def embed_text(content: str) -> list[float]:
    """Generate a 384-dim embedding vector for a single query string using local model."""
    model = _get_model()
    return model.encode(content).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch-embed multiple passages using local model."""
    model = _get_model()
    return model.encode(texts).tolist()


import numpy as np


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr = np.array(a)
    b_arr = np.array(b)
    # Cosine similarity: (A dot B) / (||A|| * ||B||)
    return np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))


def retrieve_chunks(db: Session, query: str, top_k: int = 5) -> list[dict]:
    """Embed the query and find the top-k most similar knowledge chunks
    using numpy cosine similarity in memory (since we don't have pgvector)."""
    try:
        query_embedding = embed_text(query)
    except Exception as exc:
        logger.error("Embedding API call failed: %s", exc)
        return []

    # Fetch all chunks (this is fine for small policy knowledge bases)
    results = db.execute(
        sa_text("""
            SELECT id, content, source, metadata, embedding
            FROM knowledge_chunks
            WHERE embedding IS NOT NULL
        """)
    ).fetchall()

    scored_chunks = []
    for row in results:
        # Calculate similarity
        sim = _cosine_similarity(query_embedding, row.embedding)
        scored_chunks.append({
            "content": row.content,
            "source": row.source,
            "metadata": row.metadata,
            "similarity": float(sim),
        })

    # Sort descending by similarity
    scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
    
    return scored_chunks[:top_k]
