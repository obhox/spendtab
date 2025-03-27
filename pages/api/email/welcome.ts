import type { NextApiRequest, NextApiResponse } from 'next';
import { WelcomeEmail } from '@/react-email-starter/emails/welcome-email';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

type WelcomeEmailRequestBody = {
  to: string;
  firstName: string;
  fullName?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, firstName, fullName } = req.body as WelcomeEmailRequestBody;

    if (!to || !firstName) {
      return res.status(400).json({
        error: 'Missing required fields: to or firstName'
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'SpendTab <welcome@updates.spendtab.com>',
      to: [to],
      subject: 'Welcome to SpendTab!',
      react: WelcomeEmail({ firstName, fullName }) as React.ReactElement,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}