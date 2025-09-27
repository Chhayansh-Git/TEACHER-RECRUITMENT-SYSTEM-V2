// seeder/planSeeder.ts

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
    durationInDays: 30,
    features: ['Post up to 3 jobs', 'View up to 10 pushed candidates', 'Basic Support'],
  },
  {
    name: 'Premium',
    price: 4999,
    durationInDays: 90,
    features: ['Post unlimited jobs', 'View unlimited pushed candidates', 'Priority Support', 'School Profile Highlighting'],
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