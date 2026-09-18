"use client";

import { ArrowRight, Camera, FileText, PackageCheck, ReceiptText, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createJobRecord, listCustomers } from "../../../lib/supabase/data";

const stepItems = [
  { label: "Customer", icon: FileText },
  { label: "Pairs", icon: PackageCheck },
  { label: "Photos", icon: Camera },
  { label: "Tag", icon: Tag },
  { label: "Review", icon: ReceiptText },
];

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string; email: string }>>([]);
  const [form, setForm] = useState({
    customerId: "",
    pairCount: 2,
    serviceName: "Standard Deep Clean",
    notes: "Hi, I have two pairs of white sneakers that need cleaning. Can I bring them on Friday?",
  });

  useEffect(() => {
    void (async () => {
      const nextCustomers = await listCustomers();
      setCustomers(nextCustomers);
      if (nextCustomers[0]) {
        setForm((current) => ({ ...current, customerId: nextCustomers[0].id }));
      }
    })();
  }, []);

  const previewTags = useMemo(
    () =>
      Array.from({ length: form.pairCount }, (_, index) => ({
        id: index,
        tag: `KX-1183-${String.fromCharCode(65 + index)}`,
      })),
    [form.pairCount],
  );

  const submit = async () => {
    if (!form.customerId) return;
    await createJobRecord({
      customerId: form.customerId,
      pairCount: form.pairCount,
      serviceName: form.serviceName,
      notes: form.notes,
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Orders</p>
            <h1 className="text-3xl font-bold text-slate-900">New order intake</h1>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save draft</button>
        </header>

        <div className="mb-8 grid gap-3 md:grid-cols-5">
          {stepItems.map((step, index) => (
            <div key={step.label} className={`rounded-2xl border p-3 ${index === 0 ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}>
              <div className="mb-2 flex items-center justify-between">
                <step.icon className="h-4 w-4" />
                <span className="text-xs font-semibold">0{index + 1}</span>
              </div>
              <div className="text-sm font-medium">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Customer</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                  value={form.customerId}
                  onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Number of pairs</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                  value={form.pairCount}
                  onChange={(event) => setForm((current) => ({ ...current, pairCount: Number(event.target.value) }))}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">WhatsApp / intake notes</label>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Photo intake</h2>
                <Camera className="h-5 w-5 text-slate-500" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">Upload before photos</button>
                <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">Upload after photos</button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Generated pair tags</h2>
                <Tag className="h-5 w-5 text-emerald-600" />
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {previewTags.map((preview) => (
                  <li key={`tag-${preview.id}`} className="rounded-xl bg-slate-50 p-3 font-medium">
                    {preview.tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Order summary</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span>Customer</span><span className="font-medium text-slate-900">{customers.find((customer) => customer.id === form.customerId)?.name ?? "Customer"}</span></div>
                <div className="flex justify-between"><span>Pairs</span><span className="font-medium text-slate-900">{form.pairCount}</span></div>
                <div className="flex justify-between"><span>Service</span><span className="font-medium text-slate-900">{form.serviceName}</span></div>
                <div className="flex justify-between"><span>Estimated total</span><span className="font-medium text-slate-900">R {form.pairCount * 100}</span></div>
              </div>
              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white"
                onClick={submit}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
