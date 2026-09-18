import { NextResponse } from "next/server";

import { canDeleteAccount } from "../../../lib/security";
import { getCurrentProfile } from "../../../lib/supabase/auth";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { createServiceRoleClient } from "../../../lib/supabase/service";

// DELETE /api/account — a user deletes their own account; an organizer may
// delete another by passing { userId }. This route is excluded from proxy, so
// it authorizes itself here (per the Next.js data-security guidance).
export async function DELETE(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const targetUserId = body.userId && body.userId !== profile.id ? body.userId : profile.id;
  const isSelf = targetUserId === profile.id;

  if (!canDeleteAccount(profile.role, isSelf)) {
    return NextResponse.json({ error: "You are not allowed to delete this account." }, { status: 403 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Deleting your own account also ends the current session.
  if (isSelf) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
