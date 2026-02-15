import { NextResponse } from 'next/server';
import { getOrCreateUser, saveUserSheet, getUserSheet, deleteUserSheet } from '../../../../lib/supabase';
import { extractSheetId, validateSheetAccess, getServiceAccountEmail } from '../../../../lib/googleSheets';

// GET: get connected sheet info + service account email
export async function GET(request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing x-user-id' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');
    const sheet = await getUserSheet(dbUser.id);
    const serviceAccountEmail = getServiceAccountEmail();

    return NextResponse.json({ sheet, serviceAccountEmail });
  } catch (error) {
    console.error('Get sheet connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: connect a Google Sheet
export async function POST(request) {
  try {
    const { userId, sheetUrl, email, name } = await request.json();

    if (!userId || !sheetUrl) {
      return NextResponse.json({ error: 'Missing userId or sheetUrl' }, { status: 400 });
    }

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return NextResponse.json({ error: 'URL Google Sheets không hợp lệ' }, { status: 400 });
    }

    // Validate access
    const access = await validateSheetAccess(sheetId);
    if (!access.valid) {
      const serviceEmail = getServiceAccountEmail();
      return NextResponse.json({
        error: access.error,
        serviceAccountEmail: serviceEmail,
      }, { status: 403 });
    }

    const dbUser = await getOrCreateUser(userId, email || '', name || '');
    const saved = await saveUserSheet(dbUser.id, sheetId, sheetUrl, access.title);

    return NextResponse.json({
      success: true,
      sheet: saved,
      metadata: { title: access.title, tabs: access.tabs },
    });
  } catch (error) {
    console.error('Connect sheet error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: disconnect a Google Sheet
export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(userId, '', '');
    const sheet = await getUserSheet(dbUser.id);

    if (sheet) {
      await deleteUserSheet(dbUser.id, sheet.sheet_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect sheet error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
