"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listMyOrders } from "../../../lib/supabase/data";

type Order = Awaited<ReturnType<typeof listMyOrders>>[number];

const STAGE_LABEL: Record<string, string> = {
  booked: "Booked",
  in_wash: "Washing",
  in_treatment: "Treating",
  drying: "Drying",
  finishing: "Finishing",
  qc: "Quality check",
  ready: "Ready for pickup",
  collected: "Collected",
};

const STATION_LABEL: Record<string, string> = {
  queue: "In queue",
  washing: "Washing",
  treating: "Treating",
  drying: "Drying",
  finishing: "Finishing",
  qc: "Quality check",
  ready: "Ready",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setOrders(await listMyOrders());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load your orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">My orders</p>
          <h1 className="text-3xl font-bold text-slate-900">Track your kicks</h1>
        </div>
        <Link href="/shop" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Book more
        </Link>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <PackageOpen className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-slate-600">You have no orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Browse services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{order.reference}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    {STAGE_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-lg font-bold text-slate-900">R {order.total.toLocaleString("en-ZA")}</span>
                </div>
              </div>

              <div className="space-y-2">
                {order.pairs.map((pair) => (
                  <div key={pair.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pair.tag}</div>
                      <div className="text-xs text-slate-500">{pair.serviceName}</div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {STATION_LABEL[pair.currentStation] ?? pair.currentStation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
