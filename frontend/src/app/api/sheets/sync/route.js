import { NextResponse } from 'next/server';
import {
  validateSyncToken,
  updateSyncTokenLastSync,
  upsertOrders,
  upsertExpenses,
  upsertInventory,
  upsertEmployees,
  recalculateDailyMetrics,
  checkAndCreateAlerts,
} from '../../../../lib/supabase';

export async function POST(request) {
  try {
    console.log('=== Sheets Sync API called ===');
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Authenticate via sync token
    const token = request.headers.get('x-sync-token');
    console.log('Token received:', token ? token.substring(0, 8) + '...' : 'NONE');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing x-sync-token header' },
        { status: 401 }
      );
    }

    const syncToken = await validateSyncToken(token);
    console.log('Token validation result:', syncToken ? 'VALID (user_id: ' + syncToken.user_id + ')' : 'INVALID');

    if (!syncToken) {
      return NextResponse.json(
        { error: 'Invalid or inactive sync token. Make sure you created a token on the dashboard and it is active.' },
        { status: 401 }
      );
    }

    const userId = syncToken.user_id;
    const body = await request.json();
    const { sheetType, rows } = body;

    if (!sheetType || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Missing sheetType or rows array' },
        { status: 400 }
      );
    }

    let result;
    const affectedDates = new Set();

    switch (sheetType) {
      case 'orders':
        result = await upsertOrders(userId, rows);
        rows.forEach((r) => { if (r.date) affectedDates.add(r.date); });
        break;
      case 'expenses':
        result = await upsertExpenses(userId, rows);
        rows.forEach((r) => { if (r.date) affectedDates.add(r.date); });
        break;
      case 'inventory':
        result = await upsertInventory(userId, rows);
        break;
      case 'employees':
        result = await upsertEmployees(userId, rows);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown sheetType: ${sheetType}. Use: orders, expenses, inventory, employees` },
          { status: 400 }
        );
    }

    // Recalculate daily_metrics for affected dates (orders & expenses only)
    for (const date of affectedDates) {
      await recalculateDailyMetrics(userId, date);
      await checkAndCreateAlerts(userId, date);
    }

    // Update last sync time
    await updateSyncTokenLastSync(token);

    return NextResponse.json({
      success: true,
      sheetType,
      rowsProcessed: result?.length || rows.length,
      datesRecalculated: Array.from(affectedDates),
    });
  } catch (error) {
    console.error('Sheets sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
