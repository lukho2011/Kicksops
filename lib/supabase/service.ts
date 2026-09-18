import { createClient } from "@supabase/supabase-js";

// Server-only admin client keyed with the service-role secret. It bypasses RLS
// and can manage auth users (e.g. auth.admin.deleteUser), so it must NEVER be
// imported into a client component or exposed via a NEXT_PUBLIC_ variable.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Service role client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
