// src/utils/sendSms.ts

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

interface SmsOptions {
  to: string; // Must be in E.164 format, e.g., +919999999999
  body: string;
}

const sendSms = async (options: SmsOptions) => {
  try {
    await client.messages.create({
      body: options.body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to,
    });
    console.log(`SMS sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    throw new Error('Could not send SMS');
  }
};

export default sendSms;