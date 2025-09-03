import os
import re
import json
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification, AutoModelForSeq2SeqLM, MBart50Tokenizer
from typing import List, Dict

# -------------------------------
# Global variables for models/pipelines
# -------------------------------
NER_MODEL_NAME = "Davlan/bert-base-multilingual-cased-ner-hrl"
SUM_MODEL_NAME = "facebook/mbart-large-50-many-to-many-mmt"

ner_pipeline = None
summarizer_pipeline = None

# -------------------------------
# Initialization function
# -------------------------------
def init_models(device: str = "cpu"):
    """
    Load all models and pipelines only once.
    """
    global ner_pipeline, summarizer_pipeline

    # NER model
    ner_tokenizer = AutoTokenizer.from_pretrained(NER_MODEL_NAME)
    ner_model = AutoModelForTokenClassification.from_pretrained(NER_MODEL_NAME)
    ner_pipeline = pipeline(
        "ner",
        model=ner_model,
        tokenizer=ner_tokenizer,
        grouped_entities=True,
        device=0 if device == "cuda" else -1
    )

    # Summarization model (MBart50)
    sum_tokenizer = MBart50Tokenizer.from_pretrained(SUM_MODEL_NAME, use_fast=False)
    sum_model = AutoModelForSeq2SeqLM.from_pretrained(SUM_MODEL_NAME)
    summarizer_pipeline = pipeline(
        "summarization",
        model=sum_model,
        tokenizer=sum_tokenizer,
        device=0 if device == "cuda" else -1
    )
    print("✅ Models initialized.")


# -------------------------------
# Entity Extraction
# -------------------------------
def extract_entities(text: str) -> Dict[str, List[str]]:
    entities = {}

    # Multilingual NER
    ner_results = ner_pipeline(text)
    for ent in ner_results:
        label = ent["entity_group"]
        entities.setdefault(label, []).append(ent["word"])

    # Regex-based entities
    regex_patterns = {
        "EMAIL": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "URL": r"https?://[^\s]+",
        "DATE": r"\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4})\b",
        "ID": r"\b[A-Z]{2,}\d{2,}\b"
    }
    for label, pattern in regex_patterns.items():
        matches = re.findall(pattern, text)
        if matches:
            entities.setdefault(label, []).extend(matches)

    return entities


# -------------------------------
# Summarization
# -------------------------------
def summarize_text(text: str) -> str:
    words = text.split()
    if len(words) < 25:
        return text

    try:
        summary = summarizer_pipeline(
            text,
            max_length=min(60, len(words)),
            min_length=max(10, len(words) // 3),
            do_sample=False
        )[0]['summary_text']
    except Exception:
        summary = text.split(".")[0]

    return summary


def summarize_chunk(sentences: List[str]) -> str:
    return summarize_text(" ".join(sentences))


# -------------------------------
# Merge entities across chunks
# -------------------------------
def merge_doc_entities(chunks: List[Dict]) -> Dict[str, List[str]]:
    merged = {}
    for chunk in chunks:
        for label, values in chunk.get("entities", {}).items():
            merged.setdefault(label, set()).update(values)
    return {label: list(values) for label, values in merged.items()}


# -------------------------------
# Stage 4 processing
# -------------------------------
def entity_summary(doc: dict, output_file=None):
    all_sentences = []

    for chunk in doc.get("chunks", []):
        chunk_text = " ".join(chunk["sentences"])
        all_sentences.extend(chunk["sentences"])

        # Extract entities and summarize
        chunk["entities"] = extract_entities(chunk_text)
        chunk["summary"] = summarize_chunk(chunk["sentences"])

    # Document-level summary
    doc_text = " ".join(all_sentences)
    doc["doc_summary"] = summarize_text(doc_text)

    # Merge entities
    doc["entities"] = merge_doc_entities(doc.get("chunks", []))

    # Save output if needed
    if output_file:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)
        print(f"✅ Stage 4 results saved to {output_file}")

    return doc
