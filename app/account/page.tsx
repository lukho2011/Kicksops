import { requireUser } from "../../lib/supabase/auth";
import { PortalNav } from "../components/portal-nav";
import { DeleteAccountButton } from "./delete-account-button";

const ROLE_LABEL: Record<string, string> = {
  customer: "Customer",
  employee: "Employee",
  organizer: "Organizer",
};

export default async function AccountPage() {
  const profile = await requireUser();

  return (
    <div className="min-h-screen">
      <PortalNav profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Account settings</h1>
          <p className="mt-1 text-slate-400">Manage your KicksOps profile and preferences.</p>
        </div>

        <div className="glass-card rounded-[28px] border border-slate-700 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-4 border-b border-slate-700 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-md shadow-emerald-500/30">
              {profile.fullName?.charAt(0)?.toUpperCase() ?? "K"}
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-100">{profile.fullName ?? "Member"}</p>
              <p className="text-sm text-slate-400">{ROLE_LABEL[profile.role] ?? profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 border-b border-slate-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">Name</span>
              <span className="text-sm font-medium text-slate-100">{profile.fullName ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-2 border-b border-slate-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">Email</span>
              <span className="text-sm font-medium text-slate-100">{profile.email ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">Role</span>
              <span className="text-sm font-medium text-slate-100">{ROLE_LABEL[profile.role] ?? profile.role}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <DeleteAccountButton />
        </div>
      </main>
    </div>
  );
}
