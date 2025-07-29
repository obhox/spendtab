import type { NextApiRequest, NextApiResponse } from 'next';

if (!process.env.LOOPS_API_KEY) {
  throw new Error('Missing LOOPS_API_KEY environment variable');
}

if (!process.env.WEEKLY_SUMMARY_TEMPLATE_ID) {
  throw new Error('Missing WEEKLY_SUMMARY_TEMPLATE_ID environment variable');
}

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const WEEKLY_SUMMARY_TEMPLATE_ID = process.env.WEEKLY_SUMMARY_TEMPLATE_ID;

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

    // Send email using Loops.so API
    const loopsResponse = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         transactionalId: WEEKLY_SUMMARY_TEMPLATE_ID,
         email: data.email,
        dataVariables: {
          firstName: data.firstName || 'there',
          fullName: data.fullName || data.email,
          weekStartDate: data.weekStartDate,
          weekEndDate: data.weekEndDate,
          totalIncome: data.totalIncome.toFixed(2),
          totalExpenses: data.totalExpenses.toFixed(2),
          netCashFlow: data.netCashFlow.toFixed(2),
          netCashFlowFormatted: data.netCashFlow >= 0 
            ? `+$${data.netCashFlow.toFixed(2)}` 
            : `-$${Math.abs(data.netCashFlow).toFixed(2)}`,
          transactionCount: data.transactionCount,
          topCategory1: data.topCategories[0]?.name || '',
          topCategory1Amount: data.topCategories[0]?.amount.toFixed(2) || '0.00',
          topCategory1Percentage: data.topCategories[0]?.percentage || 0,
          topCategory2: data.topCategories[1]?.name || '',
          topCategory2Amount: data.topCategories[1]?.amount.toFixed(2) || '0.00',
          topCategory2Percentage: data.topCategories[1]?.percentage || 0,
          topCategory3: data.topCategories[2]?.name || '',
          topCategory3Amount: data.topCategories[2]?.amount.toFixed(2) || '0.00',
          topCategory3Percentage: data.topCategories[2]?.percentage || 0,
        }
      })
    });

    if (!loopsResponse.ok) {
      const errorText = await loopsResponse.text();
      console.error('Loops.so API error:', errorText);
      return res.status(400).json({ error: `Failed to send email: ${errorText}` });
    }

    const responseData = await loopsResponse.json();
    console.log('Email sent successfully via Loops.so:', responseData);

    return res.status(200).json({ message: 'Weekly summary email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}