"use client";

import { ArrowRight, PackageCheck, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createJobRecord, listCustomers, listJobs, movePairToStationRemote } from "../../lib/supabase/data";

const stationOrder = ["queue", "washing", "treating", "drying", "finishing", "qc", "ready"] as const;

export default function OrdersPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string; email: string }>>([]);
  const [jobs, setJobs] = useState<Array<{ id: string; customerId: string; reference: string; status: string; notes: string; createdAt: string; pairs: Array<{ id: string; tag: string; currentStation: string; serviceName: string; price: number }> }>>([]);
  const [form, setForm] = useState({
    customerId: "",
    pairCount: 2,
    serviceName: "Standard Deep Clean",
    notes: "Two pairs for Friday pickup",
  });

  useEffect(() => {
    void (async () => {
      const [nextCustomers, nextJobs] = await Promise.all([listCustomers(), listJobs()]);
      setCustomers(nextCustomers);
      setJobs(nextJobs);
      if (nextCustomers[0]) {
        setForm((current) => ({ ...current, customerId: current.customerId || nextCustomers[0].id }));
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

  const createNewOrder = async () => {
    if (!form.customerId) return;

    const created = await createJobRecord({
      customerId: form.customerId,
      pairCount: form.pairCount,
      serviceName: form.serviceName,
      notes: form.notes,
    });

    if (created) {
      setJobs((current) => [
        {
          id: created.id,
          customerId: created.customerId,
          reference: created.reference,
          status: "booked",
          notes: created.notes,
          createdAt: created.createdAt,
          pairs: created.pairs,
        },
        ...current,
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Orders</p>
            <h1 className="text-3xl font-bold text-slate-900">Operational order board</h1>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">New intake</button>
        </header>

        <section className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Customer
                <select
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                  value={form.customerId}
                  onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Pairs
                <input
                  type="number"
                  min={1}
                  max={6}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                  value={form.pairCount}
                  onChange={(event) => setForm((current) => ({ ...current, pairCount: Number(event.target.value) }))}
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Service
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                value={form.serviceName}
                onChange={(event) => setForm((current) => ({ ...current, serviceName: event.target.value }))}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Notes
              <textarea
                className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white"
              onClick={createNewOrder}
            >
              Save order <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Generated tags</h2>
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-2">
              {previewTags.map((preview) => (
                <div key={`preview-${preview.id}`} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  {preview.tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {jobs.map((order) => (
              <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{order.reference}</div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {customers.find((customer) => customer.id === order.customerId)?.name ?? "Customer"}
                    </h2>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">{order.status}</div>
                </div>

                <div className="space-y-2">
                  {order.pairs.map((pair) => {
                    const currentIndex = stationOrder.indexOf(pair.currentStation as (typeof stationOrder)[number]);
                    const nextStation = stationOrder[Math.min(currentIndex + 1, stationOrder.length - 1)];

                    return (
                      <div key={pair.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{pair.tag}</div>
                            <div className="text-xs text-slate-500">{pair.serviceName} • {pair.currentStation}</div>
                          </div>
                          <button
                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                            onClick={async () => {
                              const moved = await movePairToStationRemote(order.id, pair.id, nextStation);
                              if (moved) {
                                setJobs((current) =>
                                  current.map((job) => {
                                    if (job.id !== order.id) return job;

                                    return {
                                      ...job,
                                      status: nextStation,
                                      pairs: job.pairs.map((currentPair) =>
                                        currentPair.id === pair.id ? { ...currentPair, currentStation: nextStation } : currentPair,
                                      ),
                                    };
                                  }),
                                );
                              }
                            }}
                          >
                            Move to {nextStation}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">Station board</h2>
            </div>
            <div className="space-y-3">
              {stationOrder.map((station) => {
                const count = jobs.reduce((total, order) => {
                  return total + order.pairs.filter((pair) => pair.currentStation === station).length;
                }, 0);

                return (
                  <div key={station} className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-slate-700">{station}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
