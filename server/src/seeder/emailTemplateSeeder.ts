// seeder/emailTemplateSeeder.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmailTemplate from '../models/emailTemplate.model';

// Load environment variables from the root .env file
dotenv.config({ path: './.env' });

/**
 * Connects to the MongoDB database using the connection string from environment variables.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

/**
 * An array containing the default email templates to be seeded into the database.
 * Each template object matches the IEmailTemplate schema.
 * - key: A unique machine-readable identifier used in the code to fetch the template.
 * - name: A human-readable name for display in the admin panel.
 * - subject: The email subject line. Can contain placeholders.
 * - body: The HTML content of the email. Can contain placeholders.
 * - placeholders: An array of strings representing the variables that can be replaced in the subject and body.
 */
const templates = [
  {
    key: 'email-verification-otp',
    name: 'Email Verification (New User)',
    subject: 'Your Verification Code for TeacherRecruit',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to TeacherRecruit!</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1976d2;">{{otp}}</p>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['otp']
  },
  {
    key: 'forgot-password-link',
    name: 'Forgot Password Reset Link',
    subject: 'Reset Your Password for TeacherRecruit',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your TeacherRecruit account.</p>
        <p>Please click the link below or paste it into your browser to set a new password:</p>
        <p><a href="{{resetURL}}" target="_blank">{{resetURL}}</a></p>
        <p>This link is valid for 10 minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['resetURL']
  },
  {
    key: 'interview-scheduled-candidate',
    name: 'Interview Scheduled (To Candidate)',
    subject: 'You Have a New Interview Invitation!',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Interview Invitation from {{schoolName}}</h2>
        <p>Hello {{candidateName}},</p>
        <p>Congratulations! You have been invited for an interview by <strong>{{schoolName}}</strong>.</p>
        <h3>Details:</h3>
        <ul>
          <li><strong>Date & Time:</strong> {{interviewDate}}</li>
          <li><strong>Type:</strong> {{interviewType}}</li>
          <li><strong>Location/Link:</strong> {{locationOrLink}}</li>
        </ul>
        <p>Please log in to your dashboard to accept or decline this invitation.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['candidateName', 'schoolName', 'interviewDate', 'interviewType', 'locationOrLink']
  },
  {
    key: 'interview-response-school',
    name: 'Interview Response (To School)',
    subject: 'Interview Response: {{candidateName}} has {{status}}',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Interview Response Received</h2>
        <p>Hello {{schoolName}},</p>
        <p>The candidate, <strong>{{candidateName}}</strong>, has <strong>{{status}}</strong> your interview invitation for the interview scheduled on {{interviewDate}}.</p>
        <p>You can view the updated status on your dashboard.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['schoolName', 'candidateName', 'status', 'interviewDate']
  },
];

/**
 * Deletes all existing templates and inserts the new ones from the `templates` array.
 */
const importData = async () => {
  try {
    console.log('Clearing existing email templates...');
    await EmailTemplate.deleteMany();
    console.log('Importing new templates...');
    await EmailTemplate.insertMany(templates);
    console.log('Email Templates Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during data import: ${error}`);
    process.exit(1);
  }
};

/**
 * Deletes all email templates from the database.
 */
const destroyData = async () => {
    try {
        console.log('Destroying all email templates...');
        await EmailTemplate.deleteMany();
        console.log('Email Templates Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error during data destruction: ${error}`);
        process.exit(1);
    }
};

/**
 * Main function to run the seeder.
 * Connects to the database and then either imports or destroys data
 * based on the command-line arguments.
 *
 * To import: `npm run seed:templates`
 * To destroy: `npm run seed:templates -d`
 */
const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();