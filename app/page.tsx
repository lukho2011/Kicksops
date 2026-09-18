import { redirect } from "next/navigation";

import { roleHome } from "../lib/security";
import { getCurrentProfile } from "../lib/supabase/auth";

// Role dispatcher. proxy.ts guarantees a session by the time we get here, so we
// just resolve the profile and send each role to its portal home.
export default async function Home() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (!profile.isActive) {
    redirect("/login?error=inactive");
  }

  redirect(roleHome(profile.role));
}
