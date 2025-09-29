// src/utils/sendEmail.ts

import nodemailer from 'nodemailer';
import EmailTemplate from '../models/emailTemplate.model';

interface EmailOptions {
  to: string;
  templateKey: string;
  payload: Record<string, any>; // e.g., { candidateName: 'John', schoolName: 'Global School' }
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Fetch the template from the database
  const template = await EmailTemplate.findOne({ key: options.templateKey });
  if (!template) {
    throw new Error(`Email template with key "${options.templateKey}" not found.`);
  }

  // 2. Replace placeholders in the subject and body
  let subject = template.subject;
  let body = template.body;
  for (const key in options.payload) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, options.payload[key]);
    body = body.replace(regex, options.payload[key]);
  }

  // 3. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Define final email options and send
  const mailOptions = {
    from: `TeacherRecruit <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: subject,
    html: body,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Templated email "${options.templateKey}" sent to ${options.to}`);
};

export default sendEmail;