# export_data.py
import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

def export_and_process_candidates():
    """
    Connects to MongoDB, fetches candidate profiles, processes them into
    a single text document each, and saves them to a JSON file.
    """
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client.get_database('test') # Make sure this is your database name

    print("Fetching candidate profiles...")
    # Use an aggregation pipeline to join users with their profiles
    pipeline = [
        {
            '$lookup': {
                'from': 'users',
                'localField': 'user',
                'foreignField': '_id',
                'as': 'userDetails'
            }
        },
        {
            '$unwind': '$userDetails'
        },
        {
            '$match': {
                'userDetails.role': 'candidate'
            }
        }
    ]

    profiles = list(db.candidateprofiles.aggregate(pipeline))
    print(f"Found {len(profiles)} candidate profiles.")

    processed_candidates = []
    for profile in profiles:
        # Combine relevant fields into a single text block
        text_parts = []

        # Add skills
        if profile.get('skills'):
            text_parts.append(f"Skills: {', '.join(profile['skills'])}")

        # Add education
        if profile.get('education'):
            for edu in profile['education']:
                text_parts.append(f"Education: {edu.get('degree', '')} from {edu.get('institution', '')}")

        # Add experience
        if profile.get('experience'):
            for exp in profile['experience']:
                text_parts.append(f"Experience: {exp.get('jobTitle', '')} at {exp.get('company', '')}")

        # Add preferred locations
        if profile.get('preferredLocations'):
            text_parts.append(f"Preferred Locations: {', '.join(profile['preferredLocations'])}")

        full_text = ". ".join(text_parts)

        processed_candidates.append({
            "candidate_id": str(profile['userDetails']['_id']),
            "document": full_text
        })

    # Save to a file
    with open("candidates_processed.json", "w") as f:
        json.dump(processed_candidates, f, indent=2)

    print("Successfully processed and saved candidates to candidates_processed.json")

if __name__ == "__main__":
    export_and_process_candidates()