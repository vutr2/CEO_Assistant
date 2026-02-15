import { NextResponse } from 'next/server';
import { getUserByDescopeId, cancelUserPlan } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id' }, { status: 400 });
    }

    const dbUser = await getUserByDescopeId(userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.plan !== 'pro') {
      return NextResponse.json({ error: 'Only Pro plan can be cancelled' }, { status: 400 });
    }

    const updated = await cancelUserPlan(dbUser.id);

    return NextResponse.json({
      success: true,
      expiresAt: updated.plan_expires_at,
    });
  } catch (error) {
    console.error('[/api/user/cancel] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
