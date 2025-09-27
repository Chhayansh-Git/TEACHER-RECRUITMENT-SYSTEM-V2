# build_index.py
import numpy as np
import faiss

def build_and_save_index():
    """
    Loads the embeddings from the .npy file and builds a Faiss index,
    saving it to disk.
    """
    print("Loading embeddings from embeddings.npy...")
    try:
        embeddings = np.load("embeddings.npy").astype('float32')
    except FileNotFoundError:
        print("Error: embeddings.npy not found.")
        print("Please run generate_embeddings.py first.")
        return

    if embeddings.shape[0] == 0:
        print("Embeddings file is empty. Nothing to index.")
        return

    # Get the dimensionality of the vectors
    d = embeddings.shape[1]

    print(f"Building Faiss index with {embeddings.shape[0]} vectors of dimension {d}...")

    # We use IndexFlatL2, which is a simple and exact search index
    index = faiss.IndexFlatL2(d)
    
    # Add the vectors to the index
    index.add(embeddings) # type: ignore

    print(f"Total vectors in index: {index.ntotal}")

    # Save the index to a file
    faiss.write_index(index, "faiss.index")

    print("Successfully built and saved the index to faiss.index")

if __name__ == "__main__":
    build_and_save_index()