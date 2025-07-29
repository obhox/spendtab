import type { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.LOOPS_API_KEY) {
  throw new Error('Missing LOOPS_API_KEY environment variable');
}

if (!process.env.WELCOME_EMAIL_TEMPLATE_ID) {
  throw new Error('Missing WELCOME_EMAIL_TEMPLATE_ID environment variable');
}

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const WELCOME_EMAIL_TEMPLATE_ID = process.env.WELCOME_EMAIL_TEMPLATE_ID;

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

    // Send email using Loops.so API
    const loopsResponse = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         transactionalId: WELCOME_EMAIL_TEMPLATE_ID,
         email: to,
        dataVariables: {
          firstName: firstName,
          fullName: fullName || firstName,
        }
      })
    });

    if (!loopsResponse.ok) {
      const errorText = await loopsResponse.text();
      console.error('Loops.so API error:', errorText);
      return res.status(400).json({ error: `Failed to send email: ${errorText}` });
    }

    const responseData = await loopsResponse.json();
    return res.status(200).json({ data: responseData });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}