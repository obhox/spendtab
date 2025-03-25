import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailRequestBody = {
  to: string;
  firstName: string;
  subject: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, firstName, subject } = req.body as EmailRequestBody;

    if (!to || !firstName || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: to, firstName, or subject'
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'SpendTab <support@updates.spendtab.com>',
      to: [to],
      subject: subject,
      react: EmailTemplate({ firstName }),
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