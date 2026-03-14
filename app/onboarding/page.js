import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/50 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Workspace created
          </p>
          <h1 className="mt-2 text-xl font-semibold text-zinc-50">
            You&apos;re almost ready to go
          </h1>
        </div>
        <p className="text-sm text-zinc-400">
          Your organization has been created. Use the email and password you
          just registered with to sign in and access your new dashboard.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Back to landing
          </Link>
        </div>
      </div>
    </main>
  );
}

