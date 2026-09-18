"use client";

import { Search, UserRoundPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createCustomerRecord, listCustomers } from "../../lib/supabase/data";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string; email: string }>>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    void (async () => {
      const nextCustomers = await listCustomers();
      setCustomers(nextCustomers);
    })();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = form.name.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => customer.name.toLowerCase().includes(term));
  }, [customers, form.name]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Customers</p>
            <h1 className="text-3xl font-bold text-slate-900">Customer directory</h1>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              const created = await createCustomerRecord({
                name: "New customer",
                phone: "+27820000009",
                email: "new@example.com",
              });

              if (created) {
                setCustomers((current) => [created, ...current]);
              }
            }}
          >
            <UserRoundPlus className="h-4 w-4" /> New customer
          </button>
        </header>

        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_160px]">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search by name or phone"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <button
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!form.name || !form.phone || !form.email) return;
              const created = await createCustomerRecord(form);
              if (created) {
                setCustomers((current) => [created, ...current]);
                setForm({ name: "", phone: "", email: "" });
              }
            }}
          >
            Add customer
          </button>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none"
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {customer.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  Active
                </span>
              </div>
              <div className="text-lg font-semibold text-slate-900">{customer.name}</div>
              <div className="mt-1 text-sm text-slate-600">{customer.phone}</div>
              <div className="mt-1 text-sm text-slate-500">{customer.email}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
