// src/utils/sendEmail.ts

import nodemailer from 'nodemailer';
import EmailTemplate from '../models/emailTemplate.model';

interface TemplateEmailOptions {
  to: string;
  templateKey: string;
  payload?: Record<string, any>; // e.g., { candidateName: 'John', schoolName: 'Global School' }
}

interface RawEmailOptions {
  to: string;
  subject: string;
  html: string;
}

type EmailOptions = TemplateEmailOptions | RawEmailOptions;

const sendEmail = async (options: EmailOptions) => {
  // Determine whether to use a template or raw subject/html
  let subject: string;
  let body: string;

  if ('templateKey' in options) {
    // 1. Fetch the template from the database
    const template = await EmailTemplate.findOne({ key: options.templateKey });
    if (!template) {
      throw new Error(`Email template with key "${options.templateKey}" not found.`);
    }

    // 2. Replace placeholders in the subject and body
    subject = template.subject;
    body = template.body;
    const payload = options.payload || {};
    for (const key in payload) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, payload[key]);
      body = body.replace(regex, payload[key]);
    }
  } else {
    // Raw email provided directly
    subject = options.subject;
    body = options.html;
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
  const mode = 'templateKey' in options ? `templated (${options.templateKey})` : 'raw';
  console.log(`Email (${mode}) sent to ${options.to}`);
};

export default sendEmail;