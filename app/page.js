import Link from "next/link";
import {
  Shield,
  Users,
  FolderKanban,
  Zap,
  FileText,
  MessageSquare,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-500/8 blur-[100px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-32 px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold shadow-lg shadow-indigo-500/25">
              CF
            </div>
            <span className="tracking-tight">ClientFlow</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="#features"
              className="hidden px-3 py-1.5 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-white sm:block"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden px-3 py-1.5 text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-white sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-zinc-800 dark:text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
            >
              Start for free
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="grid gap-16 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              <Zap className="h-3 w-3" />
              Multitenant SaaS for modern agencies
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              One place for every{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                client project
              </span>
              .
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Centralize projects, files, tasks, and feedback in a secure,
              role-based portal your clients will actually enjoy using.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 hover:text-white"
              >
                Sign in to demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                4-tier RBAC system
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Org-level data isolation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Stripe billing ready
              </span>
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 p-5 shadow-2xl shadow-black/60 backdrop-blur">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                Client dashboard
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live preview
              </span>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active projects", value: "12", color: "text-indigo-400" },
                  { label: "In review", value: "4", color: "text-amber-400" },
                  { label: "Team members", value: "18", color: "text-sky-400" },
                  { label: "Completion", value: "92%", color: "text-emerald-400" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 px-3 py-3"
                  >
                    <p className="text-[10px] text-zinc-500">{card.label}</p>
                    <p className={`mt-1 text-lg font-bold ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900 p-3">
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
                  Projects at a glance
                </p>
                <div className="space-y-2.5">
                  {[
                    { name: "Brand refresh", progress: 88, color: "#10b981" },
                    { name: "Website redesign", progress: 65, color: "#6366f1" },
                    { name: "Mobile MVP", progress: 32, color: "#f59e0b" },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="truncate text-xs text-zinc-800 dark:text-zinc-200">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.progress}%`,
                              backgroundColor: p.color,
                            }}
                          />
                        </div>
                        <span className="w-7 text-right text-[10px] text-zinc-500">
                          {p.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="space-y-12">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Features
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Everything your agency needs
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
              Built for teams that manage multiple client relationships
              simultaneously.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Role-Based Access",
                desc: "4-tier RBAC: Admin, Manager, Member, Client. Each role sees exactly what they need.",
                color: "from-indigo-500/20 to-violet-500/20",
                iconColor: "text-indigo-400",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "Multitenant Isolation",
                desc: "Every query is org-scoped. Tenants never see each other's data, tested with multitenancy tests.",
                color: "from-emerald-500/20 to-teal-500/20",
                iconColor: "text-emerald-400",
              },
              {
                icon: <FolderKanban className="h-5 w-5" />,
                title: "Project Management",
                desc: "Full project lifecycle management with tasks, statuses, priorities, and assignees.",
                color: "from-sky-500/20 to-blue-500/20",
                iconColor: "text-sky-400",
              },
              {
                icon: <FileText className="h-5 w-5" />,
                title: "File Management",
                desc: "S3-backed file uploads with presigned URLs. Clients can securely download shared deliverables.",
                color: "from-amber-500/20 to-orange-500/20",
                iconColor: "text-amber-400",
              },
              {
                icon: <MessageSquare className="h-5 w-5" />,
                title: "Realtime Comments",
                desc: "Optimistic UI comment threads on every project. Keep feedback loops tight.",
                color: "from-violet-500/20 to-purple-500/20",
                iconColor: "text-violet-400",
              },
              {
                icon: <CreditCard className="h-5 w-5" />,
                title: "Stripe Billing",
                desc: "Integrated Stripe Checkout and Customer Portal. Upgrade plans with a single click.",
                color: "from-rose-500/20 to-pink-500/20",
                iconColor: "text-rose-400",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-gradient-to-br ${feature.color} p-6 transition-all hover:border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 hover:shadow-lg hover:shadow-black/20`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 ${feature.iconColor}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Built for Scale */}
        <section className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for production, <br />
              <span className="text-indigo-400">architected for scale.</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
              ClientFlow isn't just a UI—it's a complete infrastructure blueprint. 
              We've solved the hard problems of multitenancy and security so you can 
              focus on shipping features.
            </p>
            <div className="space-y-4">
              {[
                { title: "Query-Level Security", desc: "Forced org-level scoping on every Prisma query." },
                { title: "Edge Performance", desc: "Rate limiting and session management at the edge." },
                { title: "Audit Ready", desc: "Comprehensive logging for every critical action." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-xl" />
            <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/80 p-6 backdrop-blur-xl">
              <pre className="text-[10px] leading-relaxed text-indigo-300/80 overflow-x-auto">
                <code>{`// Org-scoped safety example
export async function getProjects(session) {
  return await prisma.project.findMany({
    where: { 
      orgId: session.user.orgId // Inherently secure
    },
    include: { tasks: true }
  });
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Tech Stack Banner */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-8">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Built with
            </p>
            <h2 className="mt-3 text-xl font-bold tracking-tight">
              Production-Grade Tech Stack
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js 15",
              "Prisma 6",
              "NextAuth v5",
              "Tailwind CSS v4",
              "Stripe",
              "AWS S3",
              "Upstash Redis",
              "Resend",
              "Vitest",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="space-y-8"
        >
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Pricing
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
              Start free and scale as your agency grows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                  Starter
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">$29</span>
                  <span className="text-sm text-zinc-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                  Up to 5 team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                  Unlimited client portals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                  Projects, tasks, files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                  Email notifications
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-full border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-zinc-200 dark:bg-zinc-800"
              >
                Get started
              </Link>
            </div>
            <div className="relative rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-violet-500/10 p-8 space-y-6 shadow-xl shadow-indigo-500/10">
              <div className="absolute -top-3 right-6">
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                  <Star className="h-3 w-3" />
                  Popular
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Pro
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">$99</span>
                  <span className="text-sm text-indigo-300/70">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-indigo-100/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  Unlimited team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  Advanced RBAC & audit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  Stripe billing integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  SSO ready
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Credentials Banner */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-sky-500/10 p-8 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            Try the live demo
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Two fully-seeded tenants with complete data isolation. Log into both
            in separate windows and try pasting URLs between them — the "Iron
            Curtain" blocks all cross-tenant access.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto text-left text-xs">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Pixel Agency (Pro)</p>
              {[
                { role: "Admin", email: "alice@pixel.co", color: "border-indigo-500/30 bg-indigo-500/5" },
                { role: "Manager", email: "bob@pixel.co", color: "border-sky-500/30 bg-sky-500/5" },
                { role: "Member", email: "carol@pixel.co", color: "border-emerald-500/30 bg-emerald-500/5" },
                { role: "Client", email: "dave@acme.com", color: "border-amber-500/30 bg-amber-500/5" },
              ].map((cred) => (
                <div
                  key={cred.role}
                  className={`rounded-2xl border ${cred.color} p-3`}
                >
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{cred.role}</p>
                  <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">{cred.email}</p>
                  <p className="text-zinc-500">password123</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Nova Studio (Starter)</p>
              {[
                { role: "Admin", email: "frank@nova.co", color: "border-rose-500/30 bg-rose-500/5" },
                { role: "Manager", email: "grace@nova.co", color: "border-violet-500/30 bg-violet-500/5" },
                { role: "Client", email: "henry@startup.io", color: "border-teal-500/30 bg-teal-500/5" },
              ].map((cred) => (
                <div
                  key={cred.role}
                  className={`rounded-2xl border ${cred.color} p-3`}
                >
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{cred.role}</p>
                  <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">{cred.email}</p>
                  <p className="text-zinc-500">password123</p>
                </div>
              ))}
              <div className="rounded-2xl border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/50 p-3 mt-2">
                <p className="font-semibold text-yellow-300 text-[10px] uppercase tracking-wider">🔒 Leak Test</p>
                <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 mt-1">Copy a project URL from Pixel Agency and paste it in Nova Studio's session — it returns 403.</p>
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
          >
            Sign in to demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-8 text-center text-xs text-zinc-500">
          <p>
            Built with Next.js, Prisma, NextAuth, Stripe & ❤️ by{" "}
            <span className="text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">Aditya Raj</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
