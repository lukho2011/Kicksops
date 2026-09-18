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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Shop</p>
        <h1 className="text-3xl font-bold text-slate-900">Sneaker care services</h1>
        <p className="mt-1 text-slate-500">Pick a service and book a pickup. Prices are per pair.</p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Loading services…</p>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-slate-600">No services are available yet. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
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
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{service.name}</h2>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  R {service.price.toLocaleString("en-ZA")}
                  <span className="ml-1 text-sm font-normal text-slate-500">/ pair</span>
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
