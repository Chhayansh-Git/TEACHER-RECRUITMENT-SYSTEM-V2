// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/seeder/planSeeder.ts
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
    features: [ /* ... */ ],
    maxJobs: 1,
    maxUsers: 1,
    candidateMatchesLimit: 5,
    canViewFullProfile: false,
    weeklyProfileViews: 5, // 5 free views per week
    hasAdvancedAnalytics: false,
  },
  {
    name: 'Premium',
    price: 1999,
    annualPrice: 19999,
    features: [ /* ... */ ],
    maxJobs: 5,
    maxUsers: 5,
    candidateMatchesLimit: -1,
    canViewFullProfile: true,
    weeklyProfileViews: -1, // -1 signifies unlimited
    hasAdvancedAnalytics: true,
  },
  {
    name: 'Enterprise',
    price: 4999,
    annualPrice: 49999,
    features: [ /* ... */ ],
    maxJobs: -1,
    maxUsers: -1,
    candidateMatchesLimit: -1,
    canViewFullProfile: true,
    weeklyProfileViews: -1, // -1 signifies unlimited
    hasAdvancedAnalytics: true,
  },
];

const importData = async () => {
  try {
    await Plan.deleteMany();
    await Plan.insertMany(plans);
    console.log('Plans Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await Plan.deleteMany();
        console.log('Plans Destroyed!');
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