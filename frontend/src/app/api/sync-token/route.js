import { NextResponse } from 'next/server';
import {
  getOrCreateUser,
  getUserByDescopeId,
  createSyncToken,
  getSyncTokens,
  deleteSyncToken,
} from '../../../lib/supabase';

// GET: list sync tokens for user
export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id' }, { status: 400 });
    }

    // Auto-create user if not exists
    const dbUser = await getOrCreateUser(userId, '', '');

    const tokens = await getSyncTokens(dbUser.id);
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Get sync tokens error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: create new sync token
export async function POST(request) {
  try {
    const { userId, label, email, name } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Auto-create user if not exists
    const dbUser = await getOrCreateUser(userId, email || '', name || '');

    const token = await createSyncToken(dbUser.id, label || 'Google Sheets');
    return NextResponse.json(token);
  } catch (error) {
    console.error('Create sync token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: revoke a sync token
export async function DELETE(request) {
  try {
    const { userId, tokenId } = await request.json();
    if (!userId || !tokenId) {
      return NextResponse.json({ error: 'Missing userId or tokenId' }, { status: 400 });
    }

    const dbUser = await getUserByDescopeId(userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteSyncToken(tokenId, dbUser.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete sync token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
