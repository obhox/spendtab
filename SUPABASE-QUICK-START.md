# Supabase Quick Start Guide

This guide will walk you through the process of testing your Supabase integration with the BusinessOS app. Note that the app has two authentication systems: Clerk (built-in) and Supabase (that we're integrating).

## Step 1: Start the Application

The app is already running at: http://localhost:3001

## Step 2: Authentication Options

### Option A: Use Clerk Authentication (Built-in)
1. Go to http://localhost:3001/sign-in
2. Sign in or create an account using Clerk's interface
3. Once logged in, you'll need to get your user ID from Supabase to seed data (see Step 5)

### Option B: Use Supabase Authentication (Custom)
1. Go to http://localhost:3001/signup
2. Enter your email and password (minimum 6 characters)
3. Click "Sign up"
4. You'll see a success message saying "Account created. Please complete payment to activate your account."
5. You will be redirected to the payment page.
6. After payment, you should be redirected to the dashboard.

## Step 3: Supabase Email Confirmation Note

Since we have removed the email confirmation requirement in the UI, ensure your Supabase project has "Enable email confirmations" DISABLED in Authentication -> Providers -> Email.
Otherwise, users will not be able to log in without confirming their email manually.

## Step 4: Get Your User ID

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Navigate to "Authentication" → "Users"
3. Find your user (either the Clerk-authenticated user or your Supabase user)
4. Copy the UUID for the next step

## Step 5: Add Sample Data

**Important**: Choose the appropriate option based on your authentication method:

Option 1: If you're using Supabase authentication and are logged in through the app:
```
node scripts/seed-sample-data.js
```

Option 2: Using the script with your user ID (works with both auth systems):
```
node scripts/seed-sample-data.js YOUR_USER_ID
```
Replace `YOUR_USER_ID` with the UUID you copied from the Supabase dashboard.

## Step 6: Verify Data in the App

1. Refresh the dashboard page
2. You should now see your transactions and budgets displayed

## Troubleshooting

### No Data Showing?

1. Verify that the script ran successfully
2. Check the Supabase dashboard to ensure that data was added to the tables
3. Verify that the data is associated with your user ID
4. Make sure you're logged in to the app with the same user account

### Authentication Issues?

1. Ensure you're using the correct authentication route:
   - Clerk: /sign-in
   - Supabase: /login
2. If using Supabase, confirm your email is verified
3. Check the browser console for any error messages

### Database Connection Issues?

Run the test script to verify your Supabase connection:
```
node scripts/test-supabase.js
```

## What's Next?

Now that you have your Supabase integration working:

1. Add more transactions and budgets through the app UI
2. Explore the real-time update functionality
3. Check out the analytics based on your real data
