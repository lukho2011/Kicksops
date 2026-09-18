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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Accounts</p>
        <h1 className="text-3xl font-bold text-slate-100">Manage accounts</h1>
        <p className="mt-1 text-slate-400">Promote staff, deactivate logins, or remove accounts.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
          No accounts yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/70 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {accounts.map((account) => {
                const isSelf = account.id === selfId;
                return (
                  <tr key={account.id}>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {account.fullName ?? "—"}
                      {isSelf ? <span className="ml-2 text-xs text-emerald-400">(you)</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{account.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={account.role}
                        disabled={isSelf}
                        onChange={(event) => changeRole(account.id, event.target.value as Account["role"])}
                        className="rounded-lg border border-slate-700 bg-slate-950/40 px-2 py-1.5 text-slate-100 outline-none disabled:opacity-60"
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
                          account.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700 text-slate-300"
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
                        className="rounded-lg border border-rose-500/40 p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
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
