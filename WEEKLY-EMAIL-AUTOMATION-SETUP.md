# Weekly Email Automation Setup Guide

The weekly email automation for SpendTab has been fixed and improved. Here's what was done and how to set it up:

## Issues Found and Fixed

### 1. Missing Database Columns
The `users` table was missing the `weekly_summary_enabled` column that the automation code was trying to query.

**Solution**: Created `lib/add-email-preferences.sql` script that adds:
- `weekly_summary_enabled` (boolean, default true)
- `monthly_summary_enabled` (boolean, default true) 
- `first_name` (text)
- `full_name` (text)

### 2. No Automation Trigger
There was no scheduled job or webhook to actually call the weekly summary function.

**Solution**: Created API endpoints for manual and automated triggering:
- `/api/email/trigger-weekly-summary` - Webhook endpoint for external cron services
- `send-weekly-summary-direct.ts` - Improved email sending function

## Setup Instructions

### Step 1: Update Database Schema
Run the SQL script to add missing columns:

```sql
-- Execute this in your Supabase SQL Editor
-- File: lib/add-email-preferences.sql
```

### Step 2: Set Environment Variables
Add these to your `.env.local`:

```env
# For email automation security
AUTOMATION_SECRET_KEY=your-secure-random-key-here

# Your app URL (for internal API calls)
NEXT_PUBLIC_APP_URL=https://your-app-domain.com

# Resend API key (should already exist)
RESEND_API_KEY=your-resend-api-key
```

### Step 3: Set Up Automated Scheduling

#### Option A: External Cron Service (Recommended)
Use a service like:
- **Cron-job.org** (free)
- **EasyCron** 
- **GitHub Actions**
- **Vercel Cron** (if deployed on Vercel)

Set up a weekly cron job that makes a POST request to:
```
POST https://your-app-domain.com/api/email/trigger-weekly-summary
Authorization: Bearer your-secure-random-key-here
```

Schedule: Every Monday at 9:00 AM
Cron expression: `0 9 * * 1`

#### Option B: Vercel Cron (if using Vercel)
Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/email/trigger-weekly-summary",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

### Step 4: Test the Automation

#### Manual Test
```bash
curl -X POST https://your-app-domain.com/api/email/trigger-weekly-summary \
  -H "Authorization: Bearer your-secure-random-key-here" \
  -H "Content-Type: application/json"
```

#### Check Logs
Monitor your application logs to see:
- How many users have weekly summaries enabled
- Email sending success/failure rates
- Any errors in the process

## User Email Preferences

Users can control their email preferences by updating their profile. The system checks the `weekly_summary_enabled` field in the `users` table.

To add a UI for email preferences, you can create a settings page that allows users to toggle:
- Weekly summary emails
- Monthly summary emails

## Monitoring and Troubleshooting

### Common Issues:
1. **No emails sent**: Check if users have `weekly_summary_enabled = true`
2. **Email delivery failures**: Verify Resend API key and domain setup
3. **Cron not triggering**: Verify webhook URL and authentication token

### Logs to Monitor:
- User count with weekly summaries enabled
- Email sending success/failure rates
- Transaction data availability for each user

## Next Steps

1. **Run the database migration** (`lib/add-email-preferences.sql`)
2. **Set up environment variables**
3. **Configure external cron service**
4. **Test the automation**
5. **Add email preferences UI** (optional)
6. **Monitor logs and email delivery**

The automation will now run weekly and send summary emails to all users who have `weekly_summary_enabled = true` in their user profile.