// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/middleware/subscription.middleware.ts
import { Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { ProtectedRequest } from './auth.middleware';
import { IUser } from '../models/user.model';
import Subscription from '../models/subscription.model';
import Plan, { IPlan } from '../models/plan.model';
import Requirement from '../models/requirement.model';
import ProfileViewCredit from '../models/profileViewCredit.model'; // Import the new model

// --- Extend the Request interface to hold plan info ---
export interface SubscriptionRequest extends ProtectedRequest {
  plan?: IPlan;
}

// --- Cached plan to avoid DB calls for free users ---
let basicPlan: IPlan | null = null;

/**
 * A helper function to find the active plan for a given user.
 * It checks for a direct subscription, an organization subscription, and falls back to the Basic plan.
 * This is the core logic for determining user permissions.
 */
const getActivePlanForUser = async (user: IUser): Promise<IPlan> => {
    if (!user || user.role !== 'school') {
        // For non-school roles, we can assume they don't have subscription limits.
        return {
            name: 'Admin Access',
            maxJobs: -1,
            candidateMatchesLimit: -1,
            canViewFullProfile: true,
            hasAdvancedAnalytics: true
        } as IPlan;
    }

    const now = new Date();
    
    // 1. Check for a direct subscription (Premium)
    let subscription = await Subscription.findOne({
        school: user._id,
        status: 'active',
        endDate: { $gt: now }
    }).populate('plan');

    // 2. If no direct subscription, check for an organization subscription (Enterprise)
    if (!subscription && user.organization) {
        subscription = await Subscription.findOne({
            organization: user.organization,
            status: 'active',
            endDate: { $gt: now }
        }).populate('plan');
    }
    
    // 3. If an active subscription is found, return its plan
    if (subscription && subscription.plan) {
        return subscription.plan as unknown as IPlan;
    }

    // 4. If no active subscription, fall back to the Basic (Free) plan
    if (!basicPlan) {
        basicPlan = await Plan.findOne({ name: 'Basic' });
    }
    if (!basicPlan) {
        throw new Error('FATAL: Basic plan not found in the database. Please run the seeder.');
    }
    return basicPlan;
};

/**
 * Middleware to fetch and attach the user's current subscription plan to the request object.
 */
export const attachSubscriptionPlan = asyncHandler(async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authenticated');
    }
    req.plan = await getActivePlanForUser(req.user);
    next();
});

/**
 * A "gatekeeper" middleware for specific features.
 */
export const checkFeatureLimit = (feature: 'JOBS' | 'VIEW_CANDIDATE_PROFILE' | 'VIEW_ANALYTICS') => asyncHandler(async (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    const plan = req.plan;
    const user = req.user;

    if (!plan || !user) {
        res.status(401);
        throw new Error('Authentication or plan details missing.');
    }

    switch (feature) {
        case 'JOBS':
            const maxJobs = plan.maxJobs;
            if (maxJobs === -1) { // -1 means unlimited
                return next();
            }
            const currentJobs = await Requirement.countDocuments({ school: user._id, status: 'open' });
            if (currentJobs >= maxJobs) {
                res.status(403); // 403 Forbidden
                throw new Error(`Your '${plan.name}' plan allows for ${maxJobs} active job posting(s). Please upgrade to post more.`);
            }
            break;

        case 'VIEW_CANDIDATE_PROFILE':
            // If the plan allows unlimited full profile views, allow access immediately.
            if (plan.canViewFullProfile) {
                return next();
            }

            // --- METERED ACCESS LOGIC FOR BASIC PLAN ---
            const today = new Date();
            // Get the last Sunday. 0 is Sunday, so today.getDate() - today.getDay() gives the date of the last Sunday.
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            let credit = await ProfileViewCredit.findOne({ school: user._id });

            // If credit record doesn't exist or is for a previous week, reset it.
            if (!credit || credit.weekStartDate < startOfWeek) {
                credit = await ProfileViewCredit.findOneAndUpdate(
                    { school: user._id },
                    { viewsUsed: 0, weekStartDate: startOfWeek },
                    { upsert: true, new: true }
                );
            }
            
            // Check if the user has exceeded their weekly limit.
            if (!credit || credit.viewsUsed >= plan.weeklyProfileViews) {
                res.status(403); // Forbidden
                throw new Error(`You have used all ${plan.weeklyProfileViews} of your free profile views for this week. Upgrade to a Premium plan for unlimited views.`);
            }

            // --- IMPORTANT: Increment the view count AFTER the request is successful ---
            // We use `res.on('finish', ...)` to ensure we only count a successful view (status 2xx).
            res.on('finish', async () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                   await ProfileViewCredit.updateOne({ _id: credit?._id }, { $inc: { viewsUsed: 1 } });
                }
            });
            
            break; // Allow the request to proceed if checks pass

        case 'VIEW_ANALYTICS':
            if (!plan.hasAdvancedAnalytics) {
                res.status(403);
                throw new Error(`The '${plan.name}' plan does not include the advanced analytics dashboard. Please upgrade.`);
            }
            break;
    
        default:
            res.status(500);
            throw new Error('Invalid feature check specified.');
    }

    next();
});