import { NextResponse } from 'next/server';
import { getOrCreateUser, getDailyMetrics } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    // Get last 2 days of metrics
    const metrics = await getDailyMetrics(dbUser.id, 2);

    const today = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const yesterday = metrics.length > 1 ? metrics[metrics.length - 2] : null;

    const todayData = {
      revenue: today?.revenue || 0,
      expenses: today?.expenses || 0,
      profit: today?.profit || 0,
      profitMargin: today?.profit_margin || 0,
    };

    const yesterdayData = {
      revenue: yesterday?.revenue || 0,
      expenses: yesterday?.expenses || 0,
      profit: yesterday?.profit || 0,
    };

    const calcChange = (current, previous) => {
      if (previous === 0) return 0;
      return (((current - previous) / previous) * 100).toFixed(2);
    };

    return NextResponse.json({
      today: todayData,
      changes: {
        revenue: calcChange(todayData.revenue, yesterdayData.revenue),
        expenses: calcChange(todayData.expenses, yesterdayData.expenses),
        profit: calcChange(todayData.profit, yesterdayData.profit),
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
