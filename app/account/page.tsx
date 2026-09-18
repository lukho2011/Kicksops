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
    <div className="min-h-screen bg-slate-100">
      <PortalNav profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Account</h1>
        <p className="mt-1 text-slate-500">Manage your KicksOps login.</p>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-sm text-slate-500">Name</span>
            <span className="text-sm font-medium text-slate-900">{profile.fullName ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-900">{profile.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Role</span>
            <span className="text-sm font-medium text-slate-900">{ROLE_LABEL[profile.role] ?? profile.role}</span>
          </div>
        </div>

        <div className="mt-6">
          <DeleteAccountButton />
        </div>
      </main>
    </div>
  );
}
