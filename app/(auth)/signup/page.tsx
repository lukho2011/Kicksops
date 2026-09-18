import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">KicksOps</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your workspace</h1>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="Lukho Mokoena" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Work email</label>
            <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="owner@kicksops.co" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white">Create workspace</button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-semibold text-emerald-700">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
