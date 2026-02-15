import { NextResponse } from 'next/server';
import { getOrCreateUser, getServerSupabase } from '../../../../lib/supabase';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    const plan = dbUser.plan || 'free';
    const expiresAt = dbUser.plan_expires_at ? new Date(dbUser.plan_expires_at) : null;
    const now = new Date();

    let status = plan;
    let daysLeft = null;
    let cancelled = false;

    if (plan === 'pro') {
      if (expiresAt && expiresAt < now) {
        // Pro expired → downgrade to free
        const db = getServerSupabase();
        await db.from('users').update({ plan: 'free', plan_expires_at: null }).eq('id', dbUser.id);
        status = 'free';
      } else if (expiresAt) {
        const msLeft = expiresAt - now;
        daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      }
    } else if (plan === 'pro_cancelled') {
      cancelled = true;
      if (expiresAt && expiresAt < now) {
        // Cancelled pro expired → downgrade to free
        const db = getServerSupabase();
        await db.from('users').update({ plan: 'free', plan_expires_at: null }).eq('id', dbUser.id);
        status = 'free';
        cancelled = false;
      } else {
        // Still active until expiry
        status = 'pro';
        if (expiresAt) {
          const msLeft = expiresAt - now;
          daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
        }
      }
    } else if (plan === 'trial') {
      // Legacy trial users → treat as free if expired
      if (!expiresAt || expiresAt < now) {
        const db = getServerSupabase();
        await db.from('users').update({ plan: 'free', plan_expires_at: null }).eq('id', dbUser.id);
        status = 'free';
      } else {
        status = 'free';
      }
    }

    return NextResponse.json({
      plan: status,
      daysLeft,
      cancelled,
      expiresAt: expiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('[/api/user/plan] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
