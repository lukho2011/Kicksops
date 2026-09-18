"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { listCustomers } from "../../../lib/supabase/data";

type Customer = Awaited<ReturnType<typeof listCustomers>>[number];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setCustomers(await listCustomers());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load customers.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter(
      (customer) => customer.name.toLowerCase().includes(needle) || customer.phone.includes(needle),
    );
  }, [customers, term]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Customers</p>
        <h1 className="text-3xl font-bold text-slate-100">Customer directory</h1>
        <p className="mt-1 text-slate-400">Everyone who has signed up in this workspace.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">{error}</p>
      ) : null}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Search by name or phone"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
          No customers found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((customer) => (
            <div key={customer.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300">
                  {customer.name
                    .split(" ")
                    .map((word: string) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              </div>
              <div className="text-lg font-semibold text-slate-100">{customer.name}</div>
              <div className="mt-1 text-sm text-slate-300">{customer.phone || "—"}</div>
              <div className="mt-1 text-sm text-slate-400">{customer.email || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
