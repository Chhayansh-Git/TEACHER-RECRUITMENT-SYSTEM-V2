// src/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import errorHandler from './middleware/error.middleware';

// Import all route files
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import candidateRoutes from './routes/candidate.routes';
import schoolRoutes from './routes/school.routes';
import requirementRoutes from './routes/requirement.routes';
import adminRoutes from './routes/admin.routes';
import interviewRoutes from './routes/interview.routes';
import paymentRoutes from './routes/payment.routes';
import planRoutes from './routes/plan.routes';
import emailTemplateRoutes from './routes/emailTemplate.routes';
import settingsRoutes from './routes/settings.routes';
import reportRoutes from './routes/report.routes';
import offerLetterRoutes from './routes/offerLetter.routes'; // Import the new routes

dotenv.config();
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/', (req: Request, res: Response) => {
  res.send('Teacher Recruitment API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/offers', offerLetterRoutes); // Use the new routes

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});