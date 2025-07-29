import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek, format, subDays } from 'date-fns';

if (!process.env.LOOPS_API_KEY) {
  throw new Error('Missing LOOPS_API_KEY environment variable');
}

if (!process.env.WEEKLY_SUMMARY_TEMPLATE_ID) {
  throw new Error('Missing WEEKLY_SUMMARY_TEMPLATE_ID environment variable');
}

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const WEEKLY_SUMMARY_TEMPLATE_ID = process.env.WEEKLY_SUMMARY_TEMPLATE_ID;

async function getWeeklyData(userId: string, startDate: Date, endDate: Date) {
  // Get transactions for the week
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'));

  if (transactionError) {
    console.error('Error fetching transactions:', transactionError);
    return null;
  }

  // Calculate totals
  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

  const netCashFlow = totalIncome - totalExpenses;

  // Get top spending categories
  const expensesByCategory = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(t.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory || {})
    .map(([name, amount]) => ({
      name,
      amount: Number(amount),
      percentage: Math.round((Number(amount) / totalExpenses) * 100)
    }))
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    topCategories,
    transactionCount: transactions?.length || 0
  };
}

export async function sendWeeklySummariesDirect() {
  try {
    console.log('Starting weekly summary email automation...');
    
    // Get all active users (weekly summaries are compulsory for everyone)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name');

    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('No users found with weekly summaries enabled');
      return { success: true, message: 'No users to process', count: 0 };
    }

    console.log(`Found ${users.length} users with weekly summaries enabled`);

    const endDate = subDays(new Date(), 1); // Yesterday
    const startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // Monday

    let successCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email}`);
        
        const weeklyData = await getWeeklyData(user.id, startDate, endDate);
        if (!weeklyData) {
          console.log(`No data found for user ${user.email}, skipping...`);
          continue;
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
            email: user.email,
            dataVariables: {
              firstName: user.first_name || 'there',
              fullName: user.first_name || user.email,
              weekStartDate: format(startDate, 'MMMM d'),
              weekEndDate: format(endDate, 'MMMM d'),
              totalIncome: weeklyData.totalIncome.toFixed(2),
              totalExpenses: weeklyData.totalExpenses.toFixed(2),
              netCashFlow: weeklyData.netCashFlow.toFixed(2),
              netCashFlowFormatted: weeklyData.netCashFlow >= 0 
                ? `+$${weeklyData.netCashFlow.toFixed(2)}` 
                : `-$${Math.abs(weeklyData.netCashFlow).toFixed(2)}`,
              transactionCount: weeklyData.transactionCount,
              topCategory1: weeklyData.topCategories[0]?.name || '',
              topCategory1Amount: weeklyData.topCategories[0]?.amount.toFixed(2) || '0.00',
              topCategory1Percentage: weeklyData.topCategories[0]?.percentage || 0,
              topCategory2: weeklyData.topCategories[1]?.name || '',
              topCategory2Amount: weeklyData.topCategories[1]?.amount.toFixed(2) || '0.00',
              topCategory2Percentage: weeklyData.topCategories[1]?.percentage || 0,
              topCategory3: weeklyData.topCategories[2]?.name || '',
              topCategory3Amount: weeklyData.topCategories[2]?.amount.toFixed(2) || '0.00',
              topCategory3Percentage: weeklyData.topCategories[2]?.percentage || 0,
            }
          })
        });

        if (!loopsResponse.ok) {
          const errorText = await loopsResponse.text();
          console.error(`Failed to send email to ${user.email}:`, errorText);
          errorCount++;
        } else {
          console.log(`Weekly summary sent successfully to ${user.email}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Weekly summaries processed: ${successCount} sent, ${errorCount} failed`,
      successCount,
      errorCount,
      totalUsers: users.length
    };

    console.log('Weekly summary automation completed:', result);
    return result;
  } catch (error) {
    console.error('Error in sendWeeklySummariesDirect:', error);
    throw error;
  }
}