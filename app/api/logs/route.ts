import { NextResponse } from 'next/server';
import { getRecentLogs } from '@/lib/logger';

export async function GET() {
  try {
    const logs = await getRecentLogs(100);
    
    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
