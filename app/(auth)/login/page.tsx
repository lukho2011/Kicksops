import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">KicksOps</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 placeholder:text-slate-400" placeholder="owner@kicksops.co" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 placeholder:text-slate-400" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white">Sign in</button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          No account? <Link href="/signup" className="font-semibold text-emerald-700">Create one</Link>
        </div>
      </div>
    </main>
  );
}
