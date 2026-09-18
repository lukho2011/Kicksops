import Link from "next/link";

import type { Profile, Role } from "../../lib/supabase/auth";
import { signOut } from "../(auth)/actions";

type NavLink = { href: string; label: string };

const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  customer: [
    { href: "/shop", label: "Shop" },
    { href: "/book", label: "Book" },
    { href: "/my-orders", label: "My orders" },
  ],
  employee: [
    { href: "/work", label: "Work queue" },
    { href: "/customers", label: "Customers" },
  ],
  organizer: [
    { href: "/admin", label: "Analytics" },
    { href: "/admin/services", label: "Services" },
    { href: "/admin/accounts", label: "Accounts" },
    { href: "/work", label: "Work queue" },
    { href: "/customers", label: "Customers" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  employee: "Employee",
  organizer: "Organizer",
};

export function PortalNav({ profile }: { profile: Profile }) {
  const links = NAV_BY_ROLE[profile.role];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            KicksOps
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/account" className="text-right hover:opacity-80">
            <div className="text-sm font-semibold text-slate-900">{profile.fullName ?? profile.email}</div>
            <div className="text-xs text-slate-500">{ROLE_LABEL[profile.role]}</div>
          </Link>
          <form action={signOut}>
            <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
