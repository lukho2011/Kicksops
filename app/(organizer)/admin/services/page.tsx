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
  const [imageUrl, setImageUrl] = useState("");
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
      await createService({ name: name.trim(), price, imageUrl: imageUrl.trim() || null });
      setName("");
      setPrice(80);
      setImageUrl("");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add the service.");
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, next: { name?: string; price?: number; active?: boolean; imageUrl?: string | null }) => {
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

      <div className="mb-8 grid gap-3 rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-sm md:grid-cols-[1.3fr_160px_1fr_140px]">
        <input
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Service name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="number"
          min={0}
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Price"
          value={price}
          onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
        />
        <input
          className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2.5 text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
        <button
          type="button"
          onClick={add}
          disabled={busy || !name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
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
              className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                {service.imageUrl ? (
                  <img src={service.imageUrl} alt={service.name} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-700" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-lg font-semibold text-sky-300 ring-1 ring-slate-700">
                    {service.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-slate-100">{service.name}</div>
                  <div className="text-xs text-slate-400">{service.code}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1 text-sm text-slate-300">
                  R
                  <input
                    type="number"
                    min={0}
                    defaultValue={service.price}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-950/40 px-2 py-1.5 text-slate-100 outline-none"
                    onBlur={(event) => {
                      const next = Math.max(0, Number(event.target.value) || 0);
                      if (next !== service.price) void patch(service.id, { price: next });
                    }}
                  />
                </label>
                <input
                  className="min-w-[180px] rounded-lg border border-slate-700 bg-slate-950/40 px-2 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-400"
                  defaultValue={service.imageUrl ?? ""}
                  placeholder="Image URL"
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (value !== (service.imageUrl ?? "")) {
                      void patch(service.id, { imageUrl: value || null });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => patch(service.id, { active: !service.active })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    service.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {service.active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(service.id)}
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20"
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
