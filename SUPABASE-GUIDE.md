# Supabase Integration Guide

## Database Structure

Your BusinessOS app is now connected to Supabase with the following database structure:

### Transactions Table

This table stores all income and expense transactions.

| Column      | Type      | Description                              |
|-------------|-----------|------------------------------------------|
| id          | UUID      | Primary key                              |
| date        | DATE      | Transaction date                         |
| description | TEXT      | Transaction description                  |
| category    | TEXT      | Category (e.g., Rent, Salary, Marketing) |
| amount      | DECIMAL   | Transaction amount                       |
| type        | TEXT      | 'income' or 'expense'                    |
| notes       | TEXT      | Optional additional notes                |
| user_id     | UUID      | Foreign key to auth.users                |
| created_at  | TIMESTAMP | Creation timestamp                       |
| updated_at  | TIMESTAMP | Last update timestamp                    |

### Budgets Table

This table stores budget information for different categories.

| Column    | Type      | Description                           |
|-----------|-----------|---------------------------------------|
| id        | UUID      | Primary key                           |
| name      | TEXT      | Budget name                           |
| amount    | DECIMAL   | Total budget amount                   |
| spent     | DECIMAL   | Amount spent so far                   |
| period    | TEXT      | Budget period (e.g., Monthly, Annual) |
| category  | TEXT      | Budget category                       |
| startDate | DATE      | Start date of budget period           |
| endDate   | DATE      | End date of budget period             |
| user_id   | UUID      | Foreign key to auth.users             |
| created_at| TIMESTAMP | Creation timestamp                    |
| updated_at| TIMESTAMP | Last update timestamp                 |

## Row Level Security (RLS)

Your tables are protected with Row Level Security, ensuring that:

1. Users can only see their own data
2. Users can only insert records linked to their own user_id
3. Users can only update or delete their own records

## Utility Scripts

We've created several utility scripts to help you work with the Supabase integration:

1. **Test Supabase Connection**
   ```
   node scripts/test-supabase.js
   ```
   This script verifies that your Supabase connection is working correctly and confirms that the necessary tables exist.

2. **Check Authentication Status**
   ```
   node scripts/check-auth.js
   ```
   This script checks if you're currently authenticated with Supabase and displays your user information.

3. **Seed Sample Data**
   ```
   node scripts/seed-sample-data.js [USER_ID]
   ```
   This script adds sample transactions and budgets to your Supabase database. It can either use your current authenticated session or a specific user ID.

4. **Verify User Data**
   ```
   node scripts/verify-user-data.js YOUR_USER_ID
   ```
   This script fetches and displays all transactions and budgets for a specific user ID, including summary statistics.

## Authentication Options

The BusinessOS application supports two authentication methods:

1. **Clerk Authentication (Built-in)**
   - Sign in at: `/sign-in`
   - This is the default authentication system

2. **Supabase Authentication (Custom)**
   - Sign up at: `/signup`
   - Login at: `/login`
   - This is the authentication system we've integrated with Supabase

When using Clerk authentication, you'll need to manually provide your Supabase user ID when seeding data. See the SUPABASE-QUICK-START.md guide for detailed instructions.

## Adding Data Manually

You can also add data directly through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the "Table Editor" in the sidebar
3. Select the table you want to add data to
4. Click "Insert row" and fill in the details
5. Be sure to include your `user_id` for each record

## Context Files

The following context files have been updated to use Supabase:

1. `lib/context/TransactionContext.tsx` - Handles transaction data operations
2. `lib/context/BudgetContext.tsx` - Handles budget data operations 
3. `lib/context/AnalyticsContext.tsx` - Calculates analytics based on transaction data

These files include:
- Real-time subscriptions for live updates
- Optimistic UI updates for better user experience
- Error handling for database operations

## Troubleshooting

If you encounter issues with your Supabase integration:

1. **Authentication Issues**
   - Make sure you're signed in to the app
   - Check browser console for auth errors

2. **Data Not Appearing**
   - Verify data exists in your Supabase tables
   - Ensure data has the correct user_id

3. **Database Errors**
   - Check that your .env.local file has the correct Supabase URL and anon key
   - Verify that your tables have the correct structure
