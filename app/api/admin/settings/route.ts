import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/settings';

// GET /api/admin/settings - Retrieve current admin settings
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update admin settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await updateSettings(body);
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
