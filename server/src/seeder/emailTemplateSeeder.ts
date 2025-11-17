// server/src/seeder/emailTemplateSeeder.ts

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
        <p>The candidate, <strong>{{candidateName}}</strong>, has <strong>{{status}}</strong> your interview invitation.</p>
        <p>You can view the updated status on your dashboard.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['schoolName', 'candidateName', 'status']
  },
  {
    key: 'offer-letter-sent-candidate',
    name: 'Offer Letter Sent (To Candidate)',
    subject: 'Congratulations! You have received a job offer from {{schoolName}}',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Job Offer from {{schoolName}}</h2>
        <p>Dear {{candidateName}},</p>
        <p>Following your recent interview, we are delighted to offer you the position of <strong>{{jobTitle}}</strong> at <strong>{{schoolName}}</strong>.</p>
        <p>Please log in to your TeacherRecruit dashboard to view the full details of the offer and to formally accept or decline.</p>
        <p>We are excited about the possibility of you joining our team.</p>
        <hr/>
        <p>Best regards,<br/>The {{schoolName}} Team</p>
      </div>
    `,
    placeholders: ['candidateName', 'schoolName', 'jobTitle']
  },
  {
    key: 'offer-response-school',
    name: 'Offer Letter Response (To School)',
    subject: 'Offer Update: {{candidateName}} has {{status}} your job offer',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Job Offer Response</h2>
        <p>Hello {{schoolName}},</p>
        <p>The candidate, <strong>{{candidateName}}</strong>, has officially <strong>{{status}}d</strong> your job offer for the <strong>{{jobTitle}}</strong> position.</p>
        <p>You can view this update on your dashboard.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['schoolName', 'candidateName', 'status', 'jobTitle']
  },

  {
    key: 'group-invitation-school',
    name: 'Group Invitation (to School)',
    subject: 'You are invited to join {{organizationName}} on TeacherRecruit',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Invitation to Join {{organizationName}}</h2>
        <p>Hello,</p>
        <p>You have been invited to join the <strong>{{organizationName}}</strong> school group on the TeacherRecruit platform. Joining the group will allow your organization's administrator to manage billing and view aggregated analytics.</p>
        <p>To accept this invitation, please click the link below:</p>
        <p><a href="{{invitationURL}}" style="background-color: #1976d2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;" target="_blank">Accept Invitation</a></p>
        <p>This invitation link is valid for 7 days.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
        <hr/>
        <p>Best regards,<br/>The TeacherRecruit Team</p>
      </div>
    `,
    placeholders: ['organizationName', 'invitationURL']
  },
  
  // --- NEW TEMPLATE FOR SALES TEAM ---
  {
    key: 'enterprise-lead-notification',
    name: 'New Enterprise Lead (to Sales)',
    subject: '🚀 New Enterprise Lead: {{organizationName}}',
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>High-Intent Enterprise Lead Captured</h2>
        <p>A user has submitted the Enterprise Interest form on the website. Please follow up promptly.</p>
        <h3>Lead Details:</h3>
        <ul>
          <li><strong>Contact Name:</strong> {{contactName}}</li>
          <li><strong>Contact Email:</strong> {{contactEmail}}</li>
          <li><strong>Contact Phone:</strong> {{contactPhone}}</li>
          <li><strong>Organization Name:</strong> {{organizationName}}</li>
          <li><strong>Number of Schools:</strong> {{numberOfSchools}}</li>
        </ul>
        <h3>Message/Notes:</h3>
        <p style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">
          {{message}}
        </p>
        <hr/>
        <p>This is an automated notification from the TeacherRecruit platform.</p>
      </div>
    `,
    placeholders: ['contactName', 'contactEmail', 'contactPhone', 'organizationName', 'numberOfSchools', 'message']
  },
];

const importData = async () => {
  try {
    console.log('Syncing email templates...');
    // Using updateOne with upsert to avoid duplicate key errors and allow easy updates
    for (const template of templates) {
      await EmailTemplate.updateOne({ key: template.key }, template, { upsert: true });
    }
    console.log('Email Templates Synced Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during data sync: ${error}`);
    process.exit(1);
  }
};

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

const run = async () => {
    await connectDB();
    if (process.argv[2] === '-d') {
        await destroyData();
    } else {
        await importData();
    }
};

run();