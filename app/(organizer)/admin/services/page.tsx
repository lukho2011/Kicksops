"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createService,
  deleteService,
  listAllServices,
  updateService,
  type Service,
} from "../../../../lib/supabase/data";

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(80);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    setServices(await listAllServices());
  };

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load services.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createService({ name: name.trim(), price });
      setName("");
      setPrice(80);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add the service.");
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, next: { name?: string; price?: number; active?: boolean }) => {
    setError("");
    try {
      await updateService(id, next);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the service.");
    }
  };

  const remove = async (id: string) => {
    setError("");
    try {
      await deleteService(id);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the service.");
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Services</p>
        <h1 className="text-3xl font-bold text-slate-900">Manage services</h1>
        <p className="mt-1 text-slate-500">Add, price, deactivate, or remove what customers can book.</p>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</p>
      ) : null}

      <div className="mb-8 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_160px_140px]">
        <input
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
          placeholder="Service name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="number"
          min={0}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none"
          placeholder="Price"
          value={price}
          onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
        />
        <button
          type="button"
          onClick={add}
          disabled={busy || !name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          No services yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">{service.name}</div>
                <div className="text-xs text-slate-500">{service.code}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-slate-600">
                  R
                  <input
                    type="number"
                    min={0}
                    defaultValue={service.price}
                    className="w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-slate-900 outline-none"
                    onBlur={(event) => {
                      const next = Math.max(0, Number(event.target.value) || 0);
                      if (next !== service.price) void patch(service.id, { price: next });
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => patch(service.id, { active: !service.active })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    service.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {service.active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(service.id)}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                  aria-label={`Delete ${service.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
