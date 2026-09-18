import type { ReactNode } from "react";

import { requireRole } from "../../lib/supabase/auth";
import { PortalNav } from "../components/portal-nav";

// Organizer-only portal (analytics, services, accounts). RLS backs every write.
export default async function OrganizerLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["organizer"]);

  return (
    <div className="min-h-screen">
      <PortalNav profile={profile} />
      {children}
    </div>
  );
}
