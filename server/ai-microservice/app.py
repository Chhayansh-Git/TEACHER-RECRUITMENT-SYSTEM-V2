# app.py
import json
import faiss
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# --- Load all necessary files into memory on startup ---
print("Loading AI model, index, and IDs...")

# Load the sentence-transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the Faiss index
index = faiss.read_index("faiss.index")

# Load the candidate ID mapping
with open("candidate_ids.json", "r") as f:
    candidate_ids = json.load(f)

print("AI service is ready and running.")
# --------------------------------------------------------

@app.route('/match', methods=['POST'])
def match_candidates():
    """
    Receives a requirement text and returns a ranked list of candidate IDs.
    """
    data = request.get_json()
    if not data or 'requirement_text' not in data:
        return jsonify({"error": "Missing 'requirement_text' in request body"}), 400

    requirement_text = data['requirement_text']
    top_n = data.get('top_n', 20) # Default to finding top 20 candidates

    # 1. Convert the requirement text into an embedding
    requirement_embedding = model.encode([requirement_text])

    # 2. Use Faiss to search for the most similar vectors in our index
    # D = distances, I = indices
    distances, indices = index.search(requirement_embedding, top_n)

    # 3. Map the indices from the search result back to our original candidate IDs
    ranked_candidate_ids = [candidate_ids[i] for i in indices[0]]

    # 4. Return the ranked list of candidate IDs
    return jsonify({
        "ranked_candidate_ids": ranked_candidate_ids
    })

if __name__ == '__main__':
    # Runs the Flask app on port 5002
    app.run(port=5002, debug=True)