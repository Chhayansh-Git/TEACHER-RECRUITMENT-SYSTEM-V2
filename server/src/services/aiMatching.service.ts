// src/services/aiMatching.service.ts

import axios from 'axios';
import Requirement, { IRequirement } from '../models/requirement.model';
import User, { IUser } from '../models/user.model';

// The URL of your running Python AI microservice
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5002';

// This function orchestrates the AI matching process
export const getRankedCandidatesForRequirement = async (requirementId: string, topN: number = 20): Promise<IUser[]> => {
  // 1. Fetch the full requirement from our database
  const requirement = await Requirement.findById(requirementId);
  if (!requirement) {
    throw new Error('Requirement not found');
  }

  // 2. Combine relevant fields into a single text block for the AI model
  const requirementText = [
    requirement.title,
    requirement.description,
    requirement.subject,
    ...(requirement.qualifications || []), // Safely spread the array
    ...(requirement.benefits || []),       // Safely spread the array
  ].join(' ');

  // 3. Call the Python AI microservice's /match endpoint
  const response = await axios.post(`${AI_SERVICE_URL}/match`, {
    requirement_text: requirementText,
    top_n: topN,
  });

  const { ranked_candidate_ids } = response.data;

  if (!ranked_candidate_ids || ranked_candidate_ids.length === 0) {
    return [];
  }

  // 4. Fetch the full candidate profiles from our database using the ranked IDs
  const candidates = await User.find({
    _id: { $in: ranked_candidate_ids },
  }).select('-password');

  // Re-sort the database results to match the AI's ranking
  const candidateMap = new Map(candidates.map(c => [String(c._id), c])); // Fix: Cast _id to string
  const sortedCandidates = ranked_candidate_ids.map((id: string) => candidateMap.get(id)).filter(Boolean);

  return sortedCandidates as IUser[];
};