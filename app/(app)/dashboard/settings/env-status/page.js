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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950 px-6">
        <div className="text-center">
          <p className="text-rose-400">Error: {error}</p>
          <Link href="/dashboard/settings" className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
            ← Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link 
          href="/dashboard/settings" 
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-700 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        
        <header className="mt-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">System Status</h1>
            <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
              Admin Only
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
            Check the connection status of external services.
          </p>
        </header>

        <div className="mt-10 space-y-4">
          {Object.entries(status).map(([key, service]) => (
            <div 
              key={key}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  service.status ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {service.status ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{service.name}</h3>
                  <div className="text-[10px] text-zinc-500">
                    {service.status ? (
                      <div className="space-y-0.5">
                        <p>Service is operational and configured</p>
                        {key === 'resend' && (
                          <div className="flex flex-col gap-0.5 mt-1 border-t border-zinc-200 dark:border-zinc-800 pt-1">
                            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">From: <span className="text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">{service.fromEmail}</span></p>
                            {service.usingTestDomain ? (
                              <p className="text-amber-500/80 italic font-medium">⚠️ Using resend.dev test domain (verify addresses!)</p>
                            ) : (
                              <p className="text-emerald-500/80 font-medium font-medium">✅ Custom domain configured</p>
                            )}
                          </div>
                        )}
                        {key === 's3' && (
                          <div className="flex flex-col gap-0.5 mt-1 border-t border-zinc-200 dark:border-zinc-800 pt-1">
                            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">Bucket: <span className="text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">{service.bucket}</span></p>
                            <p className="text-emerald-500/80 font-medium">✅ {service.isR2 ? "Cloudflare R2" : "AWS S3"} Configured</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>Key missing or placeholder: {service.envVar || "Check .env"}</p>
                    )}
                  </div>
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

        <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-primary" />
            <div className="text-xs leading-relaxed text-zinc-500">
              <p className="font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">Graceful Degradation Note</p>
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
