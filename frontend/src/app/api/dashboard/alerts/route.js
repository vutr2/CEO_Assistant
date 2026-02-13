import { NextResponse } from 'next/server';
import { getOrCreateUser, getAlerts } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    const rawAlerts = await getAlerts(dbUser.id);

    // Map to the shape the frontend expects
    const alerts = rawAlerts.map((a) => ({
      id: a.id,
      message: a.message,
      severity: a.severity || 'low',
      isRead: a.is_read || false,
      timestamp: a.created_at,
    }));

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
