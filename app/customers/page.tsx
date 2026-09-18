import { Search, UserRoundPlus } from "lucide-react";

const customers = [
  { name: "Lukho Mokoena", phone: "+27 82 123 4567", jobs: 3 },
  { name: "Aisha Naidoo", phone: "+27 71 444 1198", jobs: 2 },
  { name: "Kea Burger", phone: "+27 83 565 9901", jobs: 5 },
];

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Customers</p>
            <h1 className="text-3xl font-bold text-slate-900">Customer directory</h1>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            <UserRoundPlus className="h-4 w-4" /> New customer
          </button>
        </header>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Search className="h-4 w-4 text-slate-500" />
          <input className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search by name or phone" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <div key={customer.phone} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {customer.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{customer.jobs} jobs</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">{customer.name}</div>
              <div className="mt-1 text-sm text-slate-600">{customer.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
