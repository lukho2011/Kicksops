import { Activity, DollarSign, PackageCheck, ShieldCheck, Truck, Users } from "lucide-react";

const statCards = [
  { label: "Active orders", value: "42", icon: Activity, change: "+12%" },
  { label: "Pairs in queue", value: "18", icon: PackageCheck, change: "-3" },
  { label: "Revenue", value: "R 28,450", icon: DollarSign, change: "+8.2%" },
  { label: "Unpaid", value: "R 4,920", icon: ShieldCheck, change: "4 jobs" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">KicksOps</p>
            <h1 className="text-3xl font-bold text-slate-900">Owner dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">New order</button>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">Export</button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, change }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="mt-2 text-sm text-emerald-600">{change}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Station flow</h2>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Drying capacity healthy</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {['Queue', 'Wash', 'Treat', 'Dry', 'Finish', 'QC'].map((stage, index) => (
                <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{stage}</div>
                  <div className="text-2xl font-bold text-slate-900">{[12, 7, 6, 9, 4, 5][index]}</div>
                  <div className="mt-1 text-xs text-slate-500">pairs</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Operations</h2>
              <Users className="h-5 w-5 text-slate-500" />
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><Truck className="h-4 w-4 text-emerald-600" /> Today: 6 pickups scheduled</li>
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><PackageCheck className="h-4 w-4 text-sky-600" /> 3 stuck pairs requiring review</li>
              <li className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><ShieldCheck className="h-4 w-4 text-violet-600" /> 2 risk acceptance confirmations pending</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
