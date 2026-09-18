"use client";

import { PackageSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listServices, type Service } from "../../../lib/supabase/data";

export default function ShopPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setServices(await listServices());
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load services.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Shop</p>
        <h1 className="text-3xl font-bold text-slate-100">Sneaker care services</h1>
        <p className="mt-1 text-slate-400">Pick a service and book a pickup. Prices are per pair.</p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Loading services…</p>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-slate-300">No services are available yet. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/70 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
            >
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="h-44 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-sky-600 via-indigo-600 to-slate-900 text-3xl font-bold text-white">
                  <span>{service.name.charAt(0).toUpperCase()}</span>
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-100">{service.name}</h2>
                <div className="mt-2 text-3xl font-bold text-slate-100">
                  R {service.price.toLocaleString("en-ZA")}
                  <span className="ml-1 text-sm font-normal text-slate-400">/ pair</span>
                </div>
                <Link
                  href={`/book?service=${service.id}`}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Book this
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
