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
    <header className="sticky top-0 z-20 border-b border-slate-700 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Quad Care Shoes home" className="flex shrink-0 flex-col leading-none text-[#103c75]">
            <span className="font-[var(--font-oswald)] text-lg font-bold uppercase">Quad Care</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.34em]">Shoes</span>
            <span className="mt-1 hidden text-[8px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:block">Walk clean. Step fresh.</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-sky-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/account" className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-right transition hover:border-sky-500/50 hover:bg-slate-800">
            <div className="text-sm font-semibold text-slate-100">{profile.fullName ?? profile.email}</div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{ROLE_LABEL[profile.role]}</div>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
