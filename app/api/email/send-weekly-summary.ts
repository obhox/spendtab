import { supabase } from '@/lib/supabase';
import { startOfWeek, endOfWeek, format, subDays } from 'date-fns';

// Using centralized Supabase client to avoid multiple GoTrueClient instances

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

export async function sendWeeklySummaries() {
  try {
    // Get all active users (weekly summaries are compulsory for everyone)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, full_name');

    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }

    const endDate = subDays(new Date(), 1); // Yesterday
    const startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // Monday

    // Process each user
    for (const user of users || []) {
      try {
        const weeklyData = await getWeeklyData(user.id, startDate, endDate);
        if (!weeklyData) continue;

        // Send email using the weekly-summary endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/email/weekly-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            firstName: user.first_name,
            fullName: user.full_name,
            weekStartDate: format(startDate, 'MMMM d'),
            weekEndDate: format(endDate, 'MMMM d'),
            ...weeklyData
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to send email to ${user.email}`);
        }

        console.log(`Weekly summary sent successfully to ${user.email}`);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in sendWeeklySummaries:', error);
  }
}