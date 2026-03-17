"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function EnvStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/admin/env-status");
        if (!res.ok) throw new Error("Failed to load status");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="text-center">
          <p className="text-rose-400">Error: {error}</p>
          <Link href="/dashboard/settings" className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link 
          href="/dashboard/settings" 
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        
        <header className="mt-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">System Status</h1>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Admin Only
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Check the connection status of external services.
          </p>
        </header>

        <div className="mt-10 space-y-4">
          {Object.entries(status).map(([key, service]) => (
            <div 
              key={key}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  service.status ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {service.status ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">{service.name}</h3>
                  <p className="text-[10px] text-zinc-500">
                    {service.status ? "Service is operational and configured" : `Key missing: ${service.envVar || "Check .env"}`}
                  </p>
                </div>
              </div>
              <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                service.status ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {service.status ? "Configured" : "Missing"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-6">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-primary" />
            <div className="text-xs leading-relaxed text-zinc-500">
              <p className="font-medium text-zinc-300">Graceful Degradation Note</p>
              <p className="mt-1">
                When a service is not configured, the app will automatically disable the relevant features 
                (Billing, Email, or S3 Uploads) and provide a "Demo Mode" fallback instead of crashing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
