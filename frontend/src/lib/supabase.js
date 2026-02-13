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

  // Create new user
  const { data: newUser, error } = await db
    .from('users')
    .insert({ descope_user_id: descopeUserId, email, name })
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

export async function createPayment({ userId, orderId, planId, amount }) {
  const db = getServerSupabase();
  const { data, error } = await db
    .from('payments')
    .insert({
      user_id: userId,
      order_id: orderId,
      plan_id: planId,
      amount,
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
