import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/plan.model';

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const plans = [
  {
    name: 'Basic',
    price: 0,
    annualPrice: 0,
    features: [
        '1 Active Job Posting at a time',
        'View Top 5 AI-Matched Candidates per Job',
        '5 Free Candidate Profile Views per week',
        'Basic Dashboard with Job & Candidate Counts',
        '1 User Account for your school',
        'Standard Email Support',
    ],
    maxJobs: 1,
    maxUsers: 1,
    candidateMatchesLimit: 5,
    canViewFullProfile: false,
    weeklyProfileViews: 5,
    hasAdvancedAnalytics: false,
  },
  {
    name: 'Premium',
    price: 1999,
    annualPrice: 19999,
    features: [
        'Up to 5 Active Job Postings',
        'View Unlimited AI-Matched Candidates',
        'Unlimited Full Candidate Profile Views',
        'Advanced Analytics: Recruitment Funnel',
        'Advanced Analytics: Hiring Velocity & KPIs',
        'Up to 5 User Accounts for your team',
        'Priority Email & Chat Support',
    ],
    maxJobs: 5,
    maxUsers: 5,
    candidateMatchesLimit: -1,
    canViewFullProfile: true,
    weeklyProfileViews: -1,
    hasAdvancedAnalytics: true,
  },
  {
    name: 'Enterprise',
    price: 4999,
    annualPrice: 49999,
    features: [
        'Unlimited Active Job Postings',
        'Centralized Dashboard for School Groups',
        'Aggregated Analytics for your entire organization',
        'Unlimited User Accounts across all schools',
        'Dedicated Account Manager & Phone Support',
        'All Premium Features Included',
    ],
    maxJobs: -1,
    maxUsers: -1,
    candidateMatchesLimit: -1,
    canViewFullProfile: true,
    weeklyProfileViews: -1,
    hasAdvancedAnalytics: true,
  },
];

const importData = async () => {
  try {
    await Plan.deleteMany();
    await Plan.insertMany(plans);
    console.log('Plans Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Plan.deleteMany();
        console.log('Plans Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();