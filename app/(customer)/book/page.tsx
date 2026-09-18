"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { createBooking, listServices, type Service } from "../../../lib/supabase/data";

function BookForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [pairCount, setPairCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const list = await listServices();
        setServices(list);
        const preset = searchParams.get("service");
        setServiceId(preset && list.some((s) => s.id === preset) ? preset : list[0]?.id ?? "");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load services.");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const selected = services.find((service) => service.id === serviceId);
  const total = selected ? selected.price * pairCount : 0;

  const submit = async () => {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await createBooking({
        serviceId: selected.id,
        serviceName: selected.name,
        price: selected.price,
        pairCount,
        notes,
      });
      router.push("/my-orders");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the booking.");
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Book</p>
        <h1 className="text-3xl font-bold text-slate-100">Book a service</h1>
        <p className="mt-1 text-slate-400">We&apos;ll tag each pair and track it through the wash.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : services.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 text-slate-300">
          No services are available to book yet.
        </p>
      ) : (
        <div className="space-y-5 rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-300">
            Service
            <select
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — R {service.price.toLocaleString("en-ZA")}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Number of pairs
            <input
              type="number"
              min={1}
              max={6}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none"
              value={pairCount}
              onChange={(event) => setPairCount(Math.max(1, Math.min(6, Number(event.target.value) || 1)))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Notes (optional)
            <textarea
              className="mt-2 min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none"
              placeholder="Anything we should know about your kicks?"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-sm text-slate-400">Estimated total</span>
            <span className="text-2xl font-bold text-slate-100">R {total.toLocaleString("en-ZA")}</span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy || !selected}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl px-4 py-8 text-slate-400 md:px-8">Loading…</main>}>
      <BookForm />
    </Suspense>
  );
}
