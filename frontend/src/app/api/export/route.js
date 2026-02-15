import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import {
  getOrCreateUser,
  getDailyMetrics,
  getServerSupabase,
} from '../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId, period = 30 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    // Pro plan check
    const plan = dbUser.plan || 'free';
    const isProActive =
      plan === 'pro' ||
      (plan === 'pro_cancelled' &&
        dbUser.plan_expires_at &&
        new Date(dbUser.plan_expires_at) > new Date());

    if (!isProActive) {
      return NextResponse.json(
        { error: 'Export báo cáo chỉ dành cho gói Pro. Vui lòng nâng cấp.' },
        { status: 403 },
      );
    }

    const db = getServerSupabase();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - period);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    // Fetch all data in parallel
    const [metrics, ordersResult, expensesResult] = await Promise.all([
      getDailyMetrics(dbUser.id, period),
      db
        .from('orders')
        .select('date, customer_name, product, quantity, unit_price, total, status')
        .eq('user_id', dbUser.id)
        .gte('date', fromDateStr)
        .order('date', { ascending: true }),
      db
        .from('expenses')
        .select('date, category, description, amount, paid_by')
        .eq('user_id', dbUser.id)
        .gte('date', fromDateStr)
        .order('date', { ascending: true }),
    ]);

    const orders = ordersResult.data || [];
    const expenses = expensesResult.data || [];

    // Build workbook with 3 sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan (Daily Metrics)
    const metricsData = (metrics || []).map((m) => ({
      'Ngày': m.date,
      'Doanh thu': m.revenue || 0,
      'Chi phí': m.expenses || 0,
      'Lợi nhuận': m.profit || 0,
      'Biên LN (%)': m.profit_margin || 0,
    }));
    const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
    wsMetrics['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Tổng quan');

    // Sheet 2: Đơn hàng (Orders)
    const ordersData = orders.map((o) => ({
      'Ngày': o.date,
      'Khách hàng': o.customer_name || '',
      'Sản phẩm': o.product || '',
      'Số lượng': o.quantity || 0,
      'Đơn giá': o.unit_price || 0,
      'Thành tiền': o.total || 0,
      'Trạng thái': o.status || '',
    }));
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    wsOrders['!cols'] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsOrders, 'Đơn hàng');

    // Sheet 3: Chi phí (Expenses)
    const expensesData = expenses.map((e) => ({
      'Ngày': e.date,
      'Danh mục': e.category || '',
      'Mô tả': e.description || '',
      'Số tiền': e.amount || 0,
      'Người chi': e.paid_by || '',
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
    wsExpenses['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Chi phí');

    // Write to buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `bao-cao-kinh-doanh-${period}ngay-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo báo cáo. Vui lòng thử lại.' },
      { status: 500 },
    );
  }
}
