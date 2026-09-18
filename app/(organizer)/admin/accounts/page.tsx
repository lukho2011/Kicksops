"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { canDeleteAccount } from "../../../../lib/security";
import {
  deleteAccount,
  listAccounts,
  setAccountActive,
  setAccountRole,
  type Account,
} from "../../../../lib/supabase/data";
import { getCurrentProfileClient } from "../../../../lib/supabase/profile-client";

const ROLES: Account["role"][] = ["customer", "employee", "organizer"];

export default function AccountsAdminPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selfId, setSelfId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setAccounts(await listAccounts());
  };

  useEffect(() => {
    void (async () => {
      try {
        const [, profile] = await Promise.all([refresh(), getCurrentProfileClient()]);
        if (profile) setSelfId(profile.id);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load accounts.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changeRole = async (id: string, role: Account["role"]) => {
    setError("");
    try {
      await setAccountRole(id, role);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change the role.");
    }
  };

  const toggleActive = async (account: Account) => {
    setError("");
    try {
      await setAccountActive(account.id, !account.isActive);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the account.");
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      await deleteAccount(id);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the account.");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Accounts</p>
        <h1 className="text-3xl font-bold text-slate-900">Manage accounts</h1>
        <p className="mt-1 text-slate-500">Promote staff, deactivate logins, or remove accounts.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No accounts yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((account) => {
                const isSelf = account.id === selfId;
                return (
                  <tr key={account.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {account.fullName ?? "—"}
                      {isSelf ? <span className="ml-2 text-xs text-emerald-600">(you)</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{account.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={account.role}
                        disabled={isSelf}
                        onChange={(event) => changeRole(account.id, event.target.value as Account["role"])}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-900 outline-none disabled:opacity-60"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(account)}
                        disabled={isSelf}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
                          account.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {account.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(account.id)}
                        disabled={!canDeleteAccount("organizer", isSelf) || isSelf}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        aria-label={`Delete ${account.fullName ?? account.email ?? "account"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
