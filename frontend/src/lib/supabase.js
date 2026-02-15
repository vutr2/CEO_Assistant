import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase (public, for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (with service role key, for API routes only)
export function getServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, serviceRoleKey);
}

// --- User helpers ---

export async function getOrCreateUser(descopeUserId, email, name) {
  const db = getServerSupabase();

  // Try to find existing user
  const { data: existing } = await db
    .from('users')
    .select('*')
    .eq('descope_user_id', descopeUserId)
    .single();

  if (existing) return existing;

  // Create new user with 7-day trial
  const trialExpires = new Date();
  trialExpires.setDate(trialExpires.getDate() + 7);

  const { data: newUser, error } = await db
    .from('users')
    .insert({
      descope_user_id: descopeUserId,
      email,
      name,
      plan: 'trial',
      plan_expires_at: trialExpires.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return newUser;
}

export async function getUserByDescopeId(descopeUserId) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('descope_user_id', descopeUserId)
    .single();

  if (error) return null;
  return data;
}

export async function updateUserPlan(userId, plan, expiresAt) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('users')
    .update({ plan, plan_expires_at: expiresAt })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Payment helpers ---

export async function createPayment({ userId, orderId, planId, amount, cycle }) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('payments')
    .insert({
      user_id: userId,
      order_id: orderId,
      plan_id: planId,
      amount,
      cycle: cycle || 'monthly',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentByOrderId(orderId) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('payments')
    .select('*, users(*)')
    .eq('order_id', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function updatePaymentStatus(orderId, status, vnpayDetails = {}) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('payments')
    .update({
      status,
      ...vnpayDetails,
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Metrics helpers ---

export async function getDailyMetrics(userId, days = 30) {
  const db = getServerSupabase();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await db
    .from('daily_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// --- Alerts helpers ---

export async function getAlerts(userId) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// --- Chat helpers ---

export async function saveChatMessage(userId, role, content) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('chat_messages')
    .insert({ user_id: userId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChatHistory(userId, limit = 50) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// --- User Sheets helpers ---

export async function saveUserSheet(userId, sheetId, sheetUrl, sheetName) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('user_sheets')
    .upsert({
      user_id: userId,
      sheet_id: sheetId,
      sheet_url: sheetUrl,
      sheet_name: sheetName || '',
    }, { onConflict: 'user_id,sheet_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSheet(userId) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('user_sheets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function deleteUserSheet(userId, sheetId) {
  const db = getServerSupabase();
  const { error } = await db
    .from('user_sheets')
    .delete()
    .eq('user_id', userId)
    .eq('sheet_id', sheetId);

  if (error) throw error;
}

export async function updateSheetLastSync(userId, sheetId) {
  const db = getServerSupabase();
  await db
    .from('user_sheets')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('sheet_id', sheetId);
}

// --- Sheets data upsert helpers ---

export async function upsertOrders(userId, rows) {
  const db = getServerSupabase();
  const mapped = rows.map((r) => ({
    user_id: userId,
    date: r.date,
    customer_name: r.customerName || r.customer_name || '',
    product: r.product || '',
    quantity: parseFloat(r.quantity) || 0,
    unit_price: parseFloat(r.unitPrice || r.unit_price) || 0,
    total: parseFloat(r.total) || 0,
    status: r.status || 'completed',
    notes: r.notes || '',
    sheet_row_id: r.sheetRowId || r.sheet_row_id || null,
    extra_data: r.extraData || r.extra_data || {},
  }));

  const { data, error } = await db
    .from('orders')
    .upsert(mapped, { onConflict: 'user_id,sheet_row_id', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
}

export async function upsertExpenses(userId, rows) {
  const db = getServerSupabase();
  const mapped = rows.map((r) => ({
    user_id: userId,
    date: r.date,
    category: r.category || '',
    description: r.description || '',
    amount: parseFloat(r.amount) || 0,
    paid_by: r.paidBy || r.paid_by || '',
    notes: r.notes || '',
    sheet_row_id: r.sheetRowId || r.sheet_row_id || null,
    extra_data: r.extraData || r.extra_data || {},
  }));

  const { data, error } = await db
    .from('expenses')
    .upsert(mapped, { onConflict: 'user_id,sheet_row_id', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
}

export async function upsertInventory(userId, rows) {
  const db = getServerSupabase();
  const mapped = rows.map((r) => ({
    user_id: userId,
    date: r.date,
    product_name: r.productName || r.product_name || '',
    quantity_in: parseFloat(r.quantityIn || r.quantity_in) || 0,
    quantity_out: parseFloat(r.quantityOut || r.quantity_out) || 0,
    stock_remaining: parseFloat(r.stockRemaining || r.stock_remaining) || 0,
    notes: r.notes || '',
    sheet_row_id: r.sheetRowId || r.sheet_row_id || null,
    extra_data: r.extraData || r.extra_data || {},
  }));

  const { data, error } = await db
    .from('inventory')
    .upsert(mapped, { onConflict: 'user_id,sheet_row_id', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
}

export async function upsertEmployees(userId, rows) {
  const db = getServerSupabase();
  const mapped = rows.map((r) => ({
    user_id: userId,
    employee_name: r.employeeName || r.employee_name || '',
    role: r.role || '',
    department: r.department || '',
    salary: parseFloat(r.salary) || 0,
    start_date: r.startDate || r.start_date || null,
    status: r.status || 'active',
    notes: r.notes || '',
    sheet_row_id: r.sheetRowId || r.sheet_row_id || null,
    extra_data: r.extraData || r.extra_data || {},
  }));

  const { data, error } = await db
    .from('employees')
    .upsert(mapped, { onConflict: 'user_id,sheet_row_id', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
}

// --- Auto-recalculate daily_metrics from orders + expenses ---

export async function recalculateDailyMetrics(userId, date) {
  const db = getServerSupabase();

  // Sum revenue from orders
  const { data: orderData } = await db
    .from('orders')
    .select('total')
    .eq('user_id', userId)
    .eq('date', date);

  const revenue = (orderData || []).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

  // Sum expenses
  const { data: expenseData } = await db
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .eq('date', date);

  const expenses = (expenseData || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

  // Upsert into daily_metrics
  const { error } = await db
    .from('daily_metrics')
    .upsert({
      user_id: userId,
      date,
      revenue,
      expenses,
      profit,
      profit_margin: parseFloat(profitMargin.toFixed(2)),
    }, { onConflict: 'user_id,date' });

  if (error) throw error;
}

// --- Auto-generate alerts based on metrics changes ---

export async function checkAndCreateAlerts(userId, date) {
  const db = getServerSupabase();

  // Get today and yesterday metrics
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const { data: metrics } = await db
    .from('daily_metrics')
    .select('*')
    .eq('user_id', userId)
    .in('date', [date, yesterdayStr])
    .order('date', { ascending: true });

  if (!metrics || metrics.length < 2) return;

  const prev = metrics[0];
  const curr = metrics[1];

  const alerts = [];

  // Revenue dropped > 20%
  if (prev.revenue > 0) {
    const revenueChange = ((curr.revenue - prev.revenue) / prev.revenue) * 100;
    if (revenueChange < -20) {
      alerts.push({
        user_id: userId,
        message: `Doanh thu giảm ${Math.abs(revenueChange).toFixed(1)}% so với hôm qua`,
        severity: 'high',
      });
    }
  }

  // Expenses increased > 30%
  if (prev.expenses > 0) {
    const expenseChange = ((curr.expenses - prev.expenses) / prev.expenses) * 100;
    if (expenseChange > 30) {
      alerts.push({
        user_id: userId,
        message: `Chi phí tăng ${expenseChange.toFixed(1)}% so với hôm qua`,
        severity: 'medium',
      });
    }
  }

  // Profit margin < 10%
  if (curr.profit_margin < 10 && curr.revenue > 0) {
    alerts.push({
      user_id: userId,
      message: `Biên lợi nhuận thấp: ${curr.profit_margin}%`,
      severity: 'high',
    });
  }

  if (alerts.length > 0) {
    await db.from('alerts').insert(alerts);
  }
}

// --- Generic sheet_data helpers (for custom tabs) ---

export async function upsertSheetData(userId, tabName, rows) {
  const db = getServerSupabase();
  const mapped = rows.map((r) => ({
    user_id: userId,
    tab_name: tabName,
    row_index: r.rowIndex || r.row_index,
    data: r.data || {},
    sheet_row_id: r.sheetRowId || r.sheet_row_id || null,
  }));

  const { data, error } = await db
    .from('sheet_data')
    .upsert(mapped, { onConflict: 'user_id,tab_name,row_index', ignoreDuplicates: false })
    .select();

  if (error) throw error;
  return data;
}

export async function getSheetData(userId, tabName) {
  const db = getServerSupabase();
  const query = db
    .from('sheet_data')
    .select('*')
    .eq('user_id', userId)
    .order('row_index', { ascending: true });

  if (tabName) {
    query.eq('tab_name', tabName);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
