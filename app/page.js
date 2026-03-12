import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
              CF
            </div>
            <span>ClientFlow</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-zinc-200 hover:border-zinc-500 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-indigo-500 px-4 py-1.5 font-medium text-white shadow-sm hover:bg-indigo-400"
            >
              Start for free
            </Link>
          </div>
        </header>

        <section className="grid gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-8">
            <p className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              Multitenant client portals for modern agencies
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              One place for every{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                client project
              </span>
              .
            </h1>
            <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
              Centralize projects, files, tasks, and feedback in a secure,
              role-based portal your clients will actually enjoy using.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
              >
                Create your workspace
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-zinc-300 hover:text-white"
              >
                View pricing →
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span>RBAC for admins, managers, members, and clients</span>
              <span>•</span>
              <span>Audit-friendly multitenant PostgreSQL</span>
              <span>•</span>
              <span>Ready for Stripe billing & Resend emails</span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-medium text-zinc-400">
                Client dashboard
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                Live preview
              </span>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Active projects", value: "12" },
                  { label: "In review", value: "4" },
                  { label: "Clients", value: "18" },
                  { label: "On track", value: "92%" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2"
                  >
                    <p className="text-[10px] text-zinc-500">{card.label}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-[11px] font-medium text-zinc-300">
                  Projects at a glance
                </p>
                <div className="space-y-2">
                  {["Brand refresh", "Website redesign", "Lifecycle CRM"].map(
                    (name, i) => (
                      <div
                        key={name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-200">{name}</span>
                          <span className="text-[10px] text-zinc-500">
                            Client portal • {i === 0 ? "On track" : "In review"}
                          </span>
                        </div>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full ${
                              i === 1 ? "bg-amber-400" : "bg-emerald-400"
                            }`}
                            style={{ width: i === 2 ? "45%" : i === 1 ? "70%" : "88%" }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="grid gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:grid-cols-3"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Pricing
            </p>
            <h2 className="text-lg font-semibold text-zinc-50">
              Simple, usage-based plans.
            </h2>
            <p className="text-sm text-zinc-400">
              Start on the starter plan and scale to hundreds of clients
              without switching tools.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-xs font-medium text-zinc-300">Starter</p>
            <p className="text-2xl font-semibold text-zinc-50">
              $29
              <span className="text-xs font-normal text-zinc-500"> /mo</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              <li>Up to 5 team members</li>
              <li>Unlimited client portals</li>
              <li>Projects, tasks, files, comments</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-2xl border border-indigo-500/60 bg-indigo-500/10 p-4">
            <p className="text-xs font-medium text-indigo-200">Scale</p>
            <p className="text-2xl font-semibold text-indigo-50">
              From $99
              <span className="text-xs font-normal text-indigo-200">
                {" "}
                /mo
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-indigo-100/80">
              <li>Advanced RBAC & audit trails</li>
              <li>Priority support for agencies</li>
              <li>Stripe billing and SSO ready</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

