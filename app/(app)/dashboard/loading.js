export default function LoadingDashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 animate-pulse">
        <header className="flex items-center justify-between">
          <div>
            <div className="h-3 w-16 rounded bg-zinc-800 mb-2"></div>
            <div className="h-6 w-32 rounded bg-zinc-800"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-4 w-12 rounded bg-zinc-800"></div>
            <div className="h-4 w-12 rounded bg-zinc-800"></div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 h-24"
            ></div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-zinc-800"></div>
            <div className="h-3 w-12 rounded bg-zinc-800"></div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 h-32"
              ></div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
