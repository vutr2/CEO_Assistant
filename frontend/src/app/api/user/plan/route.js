import { NextResponse } from 'next/server';
import { getOrCreateUser } from '../../../../lib/supabase';

export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');

    const plan = dbUser.plan || 'trial';
    const expiresAt = dbUser.plan_expires_at ? new Date(dbUser.plan_expires_at) : null;
    const now = new Date();

    // Determine effective status
    let status = plan;
    let daysLeft = null;

    if (plan === 'pro') {
      if (expiresAt && expiresAt < now) {
        status = 'expired';
      }
    } else if (plan === 'trial') {
      if (!expiresAt || expiresAt < now) {
        status = 'expired';
      } else {
        const msLeft = expiresAt - now;
        daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      }
    }

    return NextResponse.json({
      plan: status,
      daysLeft,
      expiresAt: expiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('[/api/user/plan] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
