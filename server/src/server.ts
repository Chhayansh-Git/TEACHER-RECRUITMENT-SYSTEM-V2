// src/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import candidateRoutes from './routes/candidate.routes'; // Import new routes
import requirementRoutes from './routes/requirement.routes';
import adminRoutes from './routes/admin.routes';
import schoolRoutes from './routes/school.routes';
import interviewRoutes from './routes/interview.routes';
import paymentRoutes from './routes/payment.routes';
import planRoutes from './routes/plan.routes';
import errorHandler from './middleware/error.middleware';
import path from 'path';
import userRoutes from './routes/user.routes';
import emailTemplateRoutes from './routes/emailTemplate.routes';
import settingsRoutes from './routes/settings.routes';
import reportRoutes from './routes/report.routes'; 

dotenv.config();
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Teacher Recruitment API is running...');
});
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes); // Use new routes
app.use('/api/requirements', requirementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/payments', paymentRoutes); 
app.use('/api/plans', planRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);

// --- USE ERROR HANDLER MIDDLEWARE ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});