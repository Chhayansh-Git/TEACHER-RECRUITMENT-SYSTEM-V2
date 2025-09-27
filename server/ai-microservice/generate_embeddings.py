# generate_embeddings.py
import json
import numpy as np
from sentence_transformers import SentenceTransformer

def generate_and_save_embeddings():
    """
    Loads processed candidate data, generates sentence embeddings for their
    documents, and saves the embeddings and IDs to files.
    """
    print("Loading processed candidate data...")
    with open("candidates_processed.json", "r") as f:
        candidates = json.load(f)

    if not candidates:
        print("No candidates found in candidates_processed.json. Exiting.")
        return

    documents = [candidate['document'] for candidate in candidates]
    candidate_ids = [candidate['candidate_id'] for candidate in candidates]

    print("Loading sentence-transformer model (this may take a moment)...")
    # We use a model that's good for semantic search
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print("Generating embeddings for all candidate documents...")
    embeddings = model.encode(documents, show_progress_bar=True)

    # Save the embeddings and the corresponding IDs
    np.save("embeddings.npy", embeddings)
    with open("candidate_ids.json", "w") as f:
        json.dump(candidate_ids, f)

    print(f"Successfully generated and saved embeddings for {len(candidates)} candidates.")
    print("Files created: embeddings.npy, candidate_ids.json")

if __name__ == "__main__":
    generate_and_save_embeddings()