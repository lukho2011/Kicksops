"use client";

import { Activity, DollarSign, PackageCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { getAnalytics } from "../../../lib/supabase/data";

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

const STAGE_LABEL: Record<string, string> = {
  booked: "Booked",
  in_wash: "Washing",
  in_treatment: "Treating",
  drying: "Drying",
  finishing: "Finishing",
  qc: "QC",
  ready: "Ready",
  collected: "Collected",
};

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setData(await getAnalytics());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rand = (value: number) => `R ${value.toLocaleString("en-ZA")}`;
  const peakRevenue = data ? Math.max(1, ...data.revenueSeries.map((point) => point.total)) : 1;
  const topService = data?.topServices[0];
  const peakService = topService ? Math.max(1, topService.total) : 1;
  const summaryText = data
    ? `${data.summary.highestServiceName} is driving the most revenue right now, with ${rand(data.summary.highestServiceTotal)} in sales. The busiest stage is ${STAGE_LABEL[data.summary.busiestStageName] ?? data.summary.busiestStageName}, which currently holds ${data.summary.busiestStageCount} jobs.`
    : "Analytics are still loading.";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Analytics</p>
        <h1 className="text-3xl font-bold text-slate-100">Business overview</h1>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</p>
      ) : null}

      {loading || !data ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <>
          <section className="mb-8 rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
            <p className="text-sm text-slate-300">Performance insight</p>
            <p className="mt-2 max-w-3xl text-lg text-slate-100">{summaryText}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Revenue", value: rand(data.revenue), icon: DollarSign },
              { label: "Total orders", value: String(data.totalOrders), icon: PackageCheck },
              { label: "Active orders", value: String(data.activeOrders), icon: Activity },
              { label: "Customers", value: String(data.customerCount), icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <div className="rounded-xl bg-sky-500/10 p-2 text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-100">{value}</div>
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-100">Revenue by day</h2>
              {data.revenueSeries.length === 0 ? (
                <p className="text-sm text-slate-400">No revenue recorded yet.</p>
              ) : (
                <div className="flex h-48 items-end gap-2">
                  {data.revenueSeries.map((point) => (
                    <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-indigo-400"
                        style={{ height: `${Math.round((point.total / peakRevenue) * 100)}%` }}
                        title={rand(point.total)}
                      />
                      <span className="text-[10px] text-slate-400">{point.day.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-100">Top services</h2>
              {data.topServices.length === 0 ? (
                <p className="text-sm text-slate-400">No sales yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((service) => (
                    <div key={service.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-200">{service.name}</span>
                        <span className="text-slate-400">{rand(service.total)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          style={{ width: `${Math.round((service.total / peakService) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-100">Orders by stage</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(data.stageCounts).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between rounded-xl bg-slate-800/80 p-3">
                    <span className="text-sm font-medium text-slate-200">{STAGE_LABEL[stage] ?? stage}</span>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100">{count}</span>
                  </div>
                ))}
                {Object.keys(data.stageCounts).length === 0 ? <p className="text-sm text-slate-400">No orders yet.</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-100">Pairs by station</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(data.stationCounts).map(([station, count]) => (
                  <div key={station} className="flex items-center justify-between rounded-xl bg-slate-800/80 p-3">
                    <span className="text-sm font-medium capitalize text-slate-200">{station}</span>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100">{count}</span>
                  </div>
                ))}
                {Object.keys(data.stationCounts).length === 0 ? <p className="text-sm text-slate-400">No pairs yet.</p> : null}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
