import { ArrowRight, Camera, FileText, PackageCheck, ReceiptText, Tag } from "lucide-react";

const stepItems = [
  { label: "Customer", icon: FileText },
  { label: "Pairs", icon: PackageCheck },
  { label: "Photos", icon: Camera },
  { label: "Tag", icon: Tag },
  { label: "Review", icon: ReceiptText },
];

export default function NewOrderPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Orders</p>
            <h1 className="text-3xl font-bold text-slate-900">New order intake</h1>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save draft</button>
        </header>

        <div className="mb-8 grid gap-3 md:grid-cols-5">
          {stepItems.map((step, index) => (
            <div key={step.label} className={`rounded-2xl border p-3 ${index === 0 ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}>
              <div className="mb-2 flex items-center justify-between">
                <step.icon className="h-4 w-4" />
                <span className="text-xs font-semibold">0{index + 1}</span>
              </div>
              <div className="text-sm font-medium">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Customer name</label>
                <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none" defaultValue="Lukho Mokoena" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none" defaultValue="+27 82 123 4567" />
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Number of pairs</label>
                <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none" defaultValue="2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Pickup day</label>
                <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none" defaultValue="Friday" />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">WhatsApp / intake notes</label>
              <textarea className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none" defaultValue="Hi, I have two pairs of white sneakers that need cleaning. Can I bring them on Friday?" />
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Photo intake</h2>
                <Camera className="h-5 w-5 text-slate-500" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">Upload before photos</button>
                <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">Upload after photos</button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Generated pair tags</h2>
                <Tag className="h-5 w-5 text-emerald-600" />
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="rounded-xl bg-slate-50 p-3 font-medium">KX-1183-A</li>
                <li className="rounded-xl bg-slate-50 p-3 font-medium">KX-1183-B</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Order summary</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span>Customer</span><span className="font-medium text-slate-900">Lukho Mokoena</span></div>
                <div className="flex justify-between"><span>Pairs</span><span className="font-medium text-slate-900">2</span></div>
                <div className="flex justify-between"><span>Service</span><span className="font-medium text-slate-900">Standard deep clean</span></div>
                <div className="flex justify-between"><span>Estimated total</span><span className="font-medium text-slate-900">R 200</span></div>
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
