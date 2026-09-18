"use client";

import { PackageCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { listCustomers, listJobs, movePairToStationRemote } from "../../../lib/supabase/data";

const stationOrder = ["queue", "washing", "treating", "drying", "finishing", "qc", "ready"] as const;

type Job = Awaited<ReturnType<typeof listJobs>>[number];
type Customer = Awaited<ReturnType<typeof listCustomers>>[number];

export default function WorkPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [nextCustomers, nextJobs] = await Promise.all([listCustomers(), listJobs()]);
        setCustomers(nextCustomers);
        setJobs(nextJobs);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load the work queue.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeJobs = useMemo(() => jobs.filter((job) => job.status !== "collected"), [jobs]);

  const advance = async (job: Job, pairId: string, nextStation: string) => {
    try {
      await movePairToStationRemote(job.id, pairId, nextStation);
      setJobs((current) =>
        current.map((existing) => {
          if (existing.id !== job.id) return existing;
          return {
            ...existing,
            status: nextStation,
            pairs: existing.pairs.map((pair) =>
              pair.id === pairId ? { ...pair, currentStation: nextStation } : pair,
            ),
          };
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not advance the pair.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Work queue</p>
        <h1 className="text-3xl font-bold text-slate-100">Operational board</h1>
        <p className="mt-1 text-slate-400">Advance each pair through the wash stations.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {activeJobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
                No active orders in the queue.
              </div>
            ) : (
              activeJobs.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{order.reference}</div>
                      <h2 className="text-xl font-semibold text-slate-100">
                        {customers.find((customer) => customer.id === order.customerId)?.name ?? "Customer"}
                      </h2>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">{order.status}</div>
                  </div>

                  <div className="space-y-2">
                    {order.pairs.map((pair) => {
                      const currentIndex = stationOrder.indexOf(pair.currentStation as (typeof stationOrder)[number]);
                      const atEnd = currentIndex >= stationOrder.length - 1;
                      const nextStation = stationOrder[Math.min(currentIndex + 1, stationOrder.length - 1)];

                      return (
                        <div key={pair.id} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-slate-100">{pair.tag}</div>
                              <div className="text-xs text-slate-400">
                                {pair.serviceName} • {pair.currentStation}
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={atEnd}
                              className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-400 disabled:opacity-40"
                              onClick={() => advance(order, pair.id, nextStation)}
                            >
                              {atEnd ? "Ready" : `Move to ${nextStation}`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-semibold text-slate-100">Station board</h2>
            </div>
            <div className="space-y-3">
              {stationOrder.map((station) => {
                const count = jobs.reduce(
                  (total, order) => total + order.pairs.filter((pair) => pair.currentStation === station).length,
                  0,
                );

                return (
                  <div key={station} className="rounded-2xl bg-slate-800/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-slate-200">{station}</span>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
