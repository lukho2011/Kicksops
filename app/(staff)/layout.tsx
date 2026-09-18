import type { ReactNode } from "react";

import { requireRole } from "../../lib/supabase/auth";
import { PortalNav } from "../components/portal-nav";

// Employees and organizers share the operational portal. RLS enforces the
// real boundary; this keeps customers out of the staff UI.
export default async function StaffLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["employee", "organizer"]);

  return (
    <div className="min-h-screen bg-slate-100">
      <PortalNav profile={profile} />
      {children}
    </div>
  );
}
