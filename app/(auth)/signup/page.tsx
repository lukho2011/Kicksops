import Link from "next/link";

import { signUp } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">KicksOps</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Sign up to book shoe-care services.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <form className="space-y-4" action={signUp}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="Lukho Mokoena" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400" placeholder="At least 6 characters" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white">Create account</button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-semibold text-emerald-700">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
