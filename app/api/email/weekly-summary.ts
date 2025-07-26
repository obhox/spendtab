import type { NextApiRequest, NextApiResponse } from 'next';
import { WeeklySummary } from '@/react-email-starter/emails/weekly-summary';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(process.env.RESEND_API_KEY);

type WeeklySummaryData = {
  userId: string;
  email: string;
  firstName?: string;
  fullName?: string;
  weekStartDate: string;
  weekEndDate: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  transactionCount: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as WeeklySummaryData;

    if (!data.email || !data.userId) {
      return res.status(400).json({
        error: 'Missing required fields: email or userId'
      });
    }

    const { data: emailResponse, error } = await resend.emails.send({
      from: 'SpendTab <support@updates.spendtab.com>',
      to: [data.email],
      subject: `Your Weekly Financial Summary (${data.weekStartDate} - ${data.weekEndDate})`,
      react: WeeklySummary({
        firstName: data.firstName,
        fullName: data.fullName,
        weekStartDate: data.weekStartDate,
        weekEndDate: data.weekEndDate,
        totalIncome: data.totalIncome,
        totalExpenses: data.totalExpenses,
        netCashFlow: data.netCashFlow,
        topCategories: data.topCategories,
        transactionCount: data.transactionCount
      }) as React.ReactElement,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!emailResponse) {
      console.error('No data returned from Resend API');
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ message: 'Weekly summary email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}