# Supabase Integration for BusinessOS

This guide will help you set up Supabase as the backend database for BusinessOS, replacing the placeholder data with real data stored in Supabase.

## Prerequisites

1. A Supabase account (you can sign up for free at [supabase.com](https://supabase.com))
2. Node.js and npm installed on your machine

## Step 1: Create a Supabase Project

1. Sign in to your Supabase account
2. Create a new project
3. Note your project URL and anon key which will be needed later

## Step 2: Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of the `lib/supabase-schema.sql` file
3. Paste the schema into the SQL Editor
4. Execute the SQL to create the necessary tables and security policies

## Step 3: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```

2. Update the `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 4: Run the Application

1. Install dependencies (if not already installed):
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to see your application running with Supabase integration

## Data Structure

The integration uses two main tables:

### Transactions Table
- Stores all income and expense transactions
- Fields include: id, date, description, category, amount, type, notes, user_id, created_at, updated_at

### Budgets Table
- Stores all budget information
- Fields include: id, name, amount, spent, period, category, startDate, endDate, user_id, created_at, updated_at

## Security

This implementation includes Row Level Security (RLS) policies to ensure that:
- Users can only see their own data
- Authentication is handled through Supabase Auth
- Each record is associated with a user_id that matches the authenticated user

## Realtime Updates

The application subscribes to realtime changes in the Supabase database, so any changes made (either through the UI or directly in the database) will be reflected in real-time across all clients.

## Troubleshooting

If you encounter any issues:

1. Check that your environment variables are correctly set
2. Verify that the SQL schema was properly executed
3. Check the browser console for any error messages
4. Ensure you're logged in if using authentication features
