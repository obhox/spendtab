#!/usr/bin/env node

/**
 * Test script for weekly email automation
 * This script tests the weekly summary email functionality
 */

const AUTOMATION_SECRET_KEY = 'spendtab-weekly-automation-2024-secure-key';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testWeeklyEmailAutomation() {
  console.log('🧪 Testing Weekly Email Automation...\n');

  try {
    console.log('📧 Triggering weekly summary emails...');
    
    const response = await fetch(`${BASE_URL}/api/email/trigger-weekly-summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTOMATION_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Weekly email automation test completed!');
    console.log('📊 Results:', JSON.stringify(result, null, 2));
    
    if (result.successCount > 0) {
      console.log(`\n🎉 Successfully sent ${result.successCount} weekly summary emails!`);
    } else {
      console.log('\n⚠️  No emails were sent. This could mean:');
      console.log('   - No users found in database');
      console.log('   - Users don\'t have transaction data for this week');
      console.log('   - Database migration hasn\'t been run yet');
    }

    if (result.errorCount > 0) {
      console.log(`\n❌ ${result.errorCount} emails failed to send. Check the logs for details.`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure your development server is running (npm run dev)');
    console.log('2. Verify LOOPS_API_KEY is set in .env.local');
    console.log('3. Check that database migration has been run');
    console.log('4. Ensure AUTOMATION_SECRET_KEY matches in .env.local');
  }
}

// Run the test
testWeeklyEmailAutomation();