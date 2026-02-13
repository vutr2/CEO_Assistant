import { NextResponse } from 'next/server';
import { getOrCreateUser, getDailyMetrics } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId, days = 30 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    const metrics = await getDailyMetrics(dbUser.id, days);

    // Map to the shape the frontend expects
    const trends = metrics.map((m) => ({
      date: m.date,
      revenue: m.revenue || 0,
      expenses: m.expenses || 0,
      profit: m.profit || 0,
      profitMargin: m.profit_margin || 0,
    }));

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Dashboard trends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
