// src/hooks/useSubscription.ts

import { useQuery } from '@tanstack/react-query';
import api from '../api';

// This interface defines the shape of the plan object we get from the backend
export interface IPlan {
  _id: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  maxJobs: number;
  maxUsers: number;
  candidateMatchesLimit: number;
  canViewFullProfile: boolean;
  hasAdvancedAnalytics: boolean;
}

const fetchMyPlan = async (): Promise<IPlan> => {
    const token = localStorage.getItem('token');
    const { data } = await api.get('/school/my-plan', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
}

/**
 * A custom hook to get the currently active subscription plan for the logged-in school.
 * It caches the data to avoid redundant API calls.
 */
export const useSubscription = () => {
    return useQuery<IPlan>({
        // This query key ensures that we're fetching the plan for the logged-in user
        queryKey: ['mySubscriptionPlan'],
        queryFn: fetchMyPlan,
        // Cache the plan details for 5 minutes to improve performance
        staleTime: 1000 * 60 * 5, 
    });
};