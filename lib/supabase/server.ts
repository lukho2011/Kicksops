import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a Server Component render the cookie store is read-only and this
          // throws; that is expected — proxy.ts refreshes the session cookie on
          // every request, so we can safely swallow it here.
          try {
            for (const cookie of cookiesToSet) {
              cookieStore.set(cookie.name, cookie.value, {
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              });
            }
          } catch {
            // no-op: session refresh handled by proxy.ts
          }
        },
      },
    },
  );
}
