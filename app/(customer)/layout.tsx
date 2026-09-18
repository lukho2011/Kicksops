import type { ReactNode } from "react";

import { requireRole } from "../../lib/supabase/auth";
import { PortalNav } from "../components/portal-nav";

// Server layout gates the whole customer portal. RLS is the real guard; this
// only keeps the wrong role out of the UI and supplies the nav profile.
export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["customer"]);

  return (
    <div className="min-h-screen">
      <PortalNav profile={profile} />
      {children}
    </div>
  );
}
