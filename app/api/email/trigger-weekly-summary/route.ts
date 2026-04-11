import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklySummariesDirect } from '../send-weekly-summary-direct';

export async function POST(request: NextRequest) {
  try {
    // Simple authentication check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AUTOMATION_SECRET_KEY;
    if (!expectedToken) {
      return NextResponse.json({ error: 'AUTOMATION_SECRET_KEY not configured' }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sendWeeklySummariesDirect();
    
    return NextResponse.json({ 
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in weekly summary automation:', error);
    return NextResponse.json({ 
      error: 'Failed to send weekly summaries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}