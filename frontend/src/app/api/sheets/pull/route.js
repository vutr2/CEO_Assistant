import { NextResponse } from 'next/server';
import {
  getOrCreateUser,
  getUserSheet,
  upsertOrders,
  upsertExpenses,
  upsertInventory,
  upsertEmployees,
  upsertSheetData,
  recalculateDailyMetrics,
  checkAndCreateAlerts,
  updateSheetLastSync,
} from '../../../../lib/supabase';
import { readAllTabs, parseDynamicRows } from '../../../../lib/googleSheets';

// POST: pull data from Google Sheets and sync to Supabase
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');
    const userSheet = await getUserSheet(dbUser.id);

    if (!userSheet) {
      return NextResponse.json({ error: 'Chưa kết nối Google Sheets. Hãy paste URL sheet trước.' }, { status: 400 });
    }

    // Read all tabs from Google Sheets
    const sheetsData = await readAllTabs(userSheet.sheet_id);

    const results = {};
    const affectedDates = new Set();

    // Process each tab dynamically
    for (const [tabName, rawRows] of Object.entries(sheetsData)) {
      const parsed = parseDynamicRows(tabName, rawRows);
      if (parsed.type === 'empty' || parsed.rows.length === 0) continue;

      if (parsed.type === 'known') {
        // Known tab → upsert into typed table
        switch (parsed.sheetType) {
          case 'orders':
            await upsertOrders(dbUser.id, parsed.rows);
            parsed.rows.forEach((r) => r.date && affectedDates.add(r.date));
            break;
          case 'expenses':
            await upsertExpenses(dbUser.id, parsed.rows);
            parsed.rows.forEach((r) => r.date && affectedDates.add(r.date));
            break;
          case 'inventory':
            await upsertInventory(dbUser.id, parsed.rows);
            break;
          case 'employees':
            await upsertEmployees(dbUser.id, parsed.rows);
            break;
        }
        results[tabName] = { type: 'known', sheetType: parsed.sheetType, count: parsed.rows.length };
      } else {
        // Custom tab → upsert into sheet_data
        await upsertSheetData(dbUser.id, tabName, parsed.rows);
        results[tabName] = { type: 'custom', count: parsed.rows.length };
      }
    }

    // Recalculate daily_metrics for affected dates
    for (const date of affectedDates) {
      await recalculateDailyMetrics(dbUser.id, date);
      await checkAndCreateAlerts(dbUser.id, date);
    }

    // Update last sync time
    await updateSheetLastSync(dbUser.id, userSheet.sheet_id);

    return NextResponse.json({
      success: true,
      results,
      datesRecalculated: Array.from(affectedDates),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sheets pull error:', error);
    return NextResponse.json(
      { error: error.message || 'Đồng bộ thất bại' },
      { status: 500 }
    );
  }
}
