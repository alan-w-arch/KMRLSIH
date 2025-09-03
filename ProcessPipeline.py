import json
from pathlib import Path

from Stages.TextExtraction import extract_text
from Stages.CleaningNormalisation import clean_normalise
from Stages.ChunkingPlaceholding import chunking
from Stages.EntitySummary import entity_summary, init_models
from Stages.EmbedIndex import indexing

STAGE4_OUTPUT_FILE = "stage4_results.json"

init_models(device="cpu")

def save_stage4_output(doc, output_file=STAGE4_OUTPUT_FILE):
    output_path = Path(output_file)

    if output_path.exists():
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                data = []
        except Exception:
            data = []
    else:
        data = []

    # Avoid duplicates
    existing_ids = {(d.get("doc_id"), d.get("chunk_id")) for d in data}
    if (doc.get("doc_id"), doc.get("chunk_id")) not in existing_ids:
        data.append(doc)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def process_file(file_path, index_dir="vector_store"):
    """
        Full pipeline: Stage 1 → Stage 5
    """

    # Stage 1: Extract text
    stage1_result = extract_text(file_path)
    print("STAGE 1 DONE")
    print(stage1_result)

    # Stage 2: Clean + normalize
    processed = clean_normalise(stage1_result)
    print("STAGE 2 DONE")
    print(processed)

    # Stage 3: Chunking
    chunks = chunking(processed, doc_id=stage1_result["doc_id"])
    print("STAGE 3 DONE")
    print(chunks)

    # Stage 4: Entity + Summarization
    docs = entity_summary(chunks)
    print("STAGE 4 DONE")
    print(docs)

    # Save Stage 4 output to JSON array (appending)
    save_stage4_output(docs)

    # Stage 5: Embedding + Indexing
    indexing(docs, index_dir)
    print("STAGE 5 DONE")

    print(f"✅ File processed through all stages: {Path(file_path).name}")
    return docs

if __name__ == "__main__":
    test_files = [
        "sample.pdf",
        "sample.docx",
        "sample.txt"
    ]

    for file in test_files:
        try:
            process_file(f"TestData/{file}")
        except Exception as e:
            print(f"❌ Failed to process {file}: {e}")
