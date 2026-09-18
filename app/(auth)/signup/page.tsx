import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { signUp } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const benefits = [
    "Book services in minutes",
    "Track every order clearly",
    "Manage your account easily",
  ];

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="glass-card grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-emerald-500/20 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 p-8 text-white sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_35%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-50">
                <Sparkles className="h-3.5 w-3.5" /> KicksOps
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Start your premium shoe-care routine.
              </h1>
              <p className="mt-3 max-w-md text-sm text-emerald-50/90 sm:text-base">
                Create an account to schedule cleanings, follow orders, and keep your favorites in one place.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                  <span className="text-sm font-medium text-emerald-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-950/40 p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Create account</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-100">Looks good on you.</h2>
            </div>

            {error ? (
              <p className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            <form className="space-y-4" action={signUp}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="fullName">
                  Full name
                </label>
                <input id="fullName" name="fullName" required className="field-input" placeholder="Lukho Mokoena" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">
                  Email
                </label>
                <input id="email" name="email" type="email" required autoComplete="email" className="field-input" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
                <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className="field-input" placeholder="At least 6 characters" />
              </div>

              <button type="submit" className="primary-button mt-2">
                <span>Create account</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 border-t border-slate-700 pt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
