# Weekly Email Automation Setup Guide (Loops.so)

The weekly email automation for SpendTab has been updated to use Loops.so and is **compulsory for all users**. Here's what was done and how to set it up:

## Issues Found and Fixed

### 1. Email Service Migration
Updated from Resend to Loops.so for better email delivery and template management.

### 2. No Automation Trigger
There was no scheduled job or webhook to actually call the weekly summary function.

**Solution**: Created `app/api/email/trigger-weekly-summary.ts` endpoint that can be called by external cron services.

### 3. Internal API Call Issue
The original code tried to make internal API calls which don't work properly in serverless environments.

**Solution**: Created `app/api/email/send-weekly-summary-direct.ts` that sends emails directly without internal API calls.

## Setup Instructions

### 1. ~~Database Migration~~ (NOT NEEDED)
**Since weekly emails are compulsory for all users, no database migration is required.** The system will send weekly summaries to all users in your database.

### 2. Environment Variables
Add these environment variables to your `.env.local` file:

```env
# Loops.so API Configuration
LOOPS_API_KEY=your_loops_api_key_here

# Loops.so Template IDs (already created)
WELCOME_EMAIL_TEMPLATE_ID=cmdh0r93b392sz10jstjbhm88
WEEKLY_SUMMARY_TEMPLATE_ID=cm8u5lov71yj2av0128qipir3

# Automation Security
AUTOMATION_SECRET_KEY=your-secure-random-key-here

# App URL (for internal API calls)
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### 3. Loops.so Template Setup ✅ COMPLETED
The required transactional email templates have already been created in Loops.so:

- **Welcome Email Template**: `cmdh0r93b392sz10jstjbhm88`
- **Weekly Summary Template**: `cm8u5lov71yj2av0128qipir3`

These template IDs are now configured in the environment variables and the code will automatically use them.

**Available Data Variables:**
- `firstName` - User's first name
- `fullName` - User's full name
- `weekStartDate` - Week start date (e.g., "January 15")
- `weekEndDate` - Week end date (e.g., "January 21")
- `totalIncome` - Total income for the week (formatted as "1234.56")
- `totalExpenses` - Total expenses for the week (formatted as "1234.56")
- `netCashFlow` - Net cash flow (formatted as "1234.56")
- `netCashFlowFormatted` - Net cash flow with +/- sign (e.g., "+$1234.56" or "-$1234.56")
- `transactionCount` - Number of transactions
- `topCategory1` - Top spending category name
- `topCategory1Amount` - Top category amount (formatted as "1234.56")
- `topCategory1Percentage` - Top category percentage (e.g., 45)
- `topCategory2` - Second top category name
- `topCategory2Amount` - Second category amount
- `topCategory2Percentage` - Second category percentage
- `topCategory3` - Third top category name
- `topCategory3Amount` - Third category amount
- `topCategory3Percentage` - Third category percentage

**Example Template Structure:**
```html
<h1>Your Weekly Financial Summary</h1>
<p>Hi {{firstName}},</p>
<p>Here's your financial summary for {{weekStartDate}} - {{weekEndDate}}:</p>

<div>
  <h2>Overview</h2>
  <p>Total Income: ${{totalIncome}}</p>
  <p>Total Expenses: ${{totalExpenses}}</p>
  <p>Net Cash Flow: {{netCashFlowFormatted}}</p>
  <p>Transactions: {{transactionCount}}</p>
</div>

<div>
  <h2>Top Spending Categories</h2>
  <ol>
    <li>{{topCategory1}}: ${{topCategory1Amount}} ({{topCategory1Percentage}}%)</li>
    <li>{{topCategory2}}: ${{topCategory2Amount}} ({{topCategory2Percentage}}%)</li>
    <li>{{topCategory3}}: ${{topCategory3Amount}} ({{topCategory3Percentage}}%)</li>
  </ol>
</div>
```

### 4. Automated Scheduling

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
Add to your `vercel.json`:
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

### 5. Testing

#### Manual Test
You can manually trigger the weekly summary by making a POST request:

```bash
curl -X POST https://your-app-domain.com/api/email/trigger-weekly-summary \
  -H "Authorization: Bearer your-secure-random-key-here"
```

#### Check Logs
Monitor your application logs for:
- User count with weekly summaries enabled
- Email sending success/failure rates
- Loops.so API responses

## Files Modified

1. **`app/api/email/send-weekly-summary-direct.ts`** - Updated to use Loops.so API
2. **`app/api/email/weekly-summary.ts`** - Updated to use Loops.so API
3. **`app/api/email/trigger-weekly-summary.ts`** - Webhook endpoint for automation
4. **`lib/add-email-preferences.sql`** - Database migration script

## Troubleshooting

1. **No emails being sent**: Check if users exist in your database and have transaction data
2. **Email delivery failures**: Verify Loops.so API key and template IDs
3. **Cron not triggering**: Verify webhook URL and authentication token
4. **Template not found**: Ensure the `weekly-summary` template exists in Loops.so

### Logs to Monitor:
- Total user count in database
- Email sending success/failure rates
- Users with transaction data for the week
- Loops.so API responses

## Next Steps

1. **Run the database migration** (`lib/add-email-preferences.sql`)
2. **Set up environment variables** (LOOPS_API_KEY, AUTOMATION_SECRET_KEY)
3. **Create Loops.so email template** with ID `weekly-summary`
4. **Configure external cron service**
5. **Test the automation**
6. **Add email preferences UI** (optional)
7. **Monitor logs and email delivery**

The automation will now run weekly and send summary emails via Loops.so to **ALL users** in your database. No user preferences are checked - everyone gets the weekly summary automatically.