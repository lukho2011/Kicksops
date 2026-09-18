import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">KicksOps</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Shoe-care operations back office</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Log in</Link>
            <Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Open dashboard</Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "New order", value: "Fast intake" },
            { title: "Pair tracking", value: "Barcode + QR" },
            { title: "Owner insights", value: "Revenue + margin" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm text-slate-500">{item.title}</div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-emerald-600 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Phase 1</p>
          <h2 className="mt-2 text-2xl font-bold">Foundation complete</h2>
          <p className="mt-3 max-w-2xl text-emerald-50">
            Multi-tenant Supabase schema, RLS considerations, app shell, security checks, and setup documentation are in place.
          </p>
        </div>
      </div>
    </main>
  );
}
