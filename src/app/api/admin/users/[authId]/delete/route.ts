import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { deleteUserData } from '@/lib/gdpr/delete-user-data';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ authId: string }> },
) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  const { authId } = await params;
  if (!authId) {
    return NextResponse.json({ error: 'Missing authId' }, { status: 400 });
  }

  try {
    const summary = await deleteUserData(authId);

    console.warn(
      `[GDPR] Admin-triggered deletion: targetAuthId=${authId}, adminEmail=${auth.user.email}, summary=${JSON.stringify(summary)}`,
    );

    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error('[GDPR] Admin delete error:', err);
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 },
    );
  }
}
