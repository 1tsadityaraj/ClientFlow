"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Can } from "../../../../components/Can";
import { getPlan } from "../../../../lib/plans.js";

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-zinc-800" />
      <div className="h-24 rounded-2xl border border-zinc-800 bg-zinc-900/40" />
      <div className="h-24 rounded-2xl border border-zinc-800 bg-zinc-900/40" />
    </div>
  );
}

export default function SettingsForm({ org }) {
  const searchParams = useSearchParams();
  const [upgradedToast, setUpgradedToast] = useState(false);
  const [name, setName] = useState(org?.name ?? "");
  const [slug, setSlug] = useState(org?.slug ?? "");
  const [primaryColor, setPrimaryColor] = useState(org?.primaryColor ?? "#6366f1");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  useEffect(() => {
    if (org) {
      setName(org.name);
      setSlug(org.slug);
      if (org.primaryColor) setPrimaryColor(org.primaryColor);
    }
  }, [org]);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setUpgradedToast(true);
      const t = setTimeout(() => setUpgradedToast(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  async function handleBillingCheckout() {
    setBillingLoading(true);
    setBillingError("");
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBillingLoading(false);
    if (!res.ok) {
      setBillingError(data.error || "Failed to start checkout");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function handleBillingPortal() {
    setBillingLoading(true);
    setBillingError("");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBillingLoading(false);
    if (!res.ok) {
      setBillingError(data.error || "Failed to open portal");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function handleSaveOrg(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    const res = await fetch(`/api/orgs/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, primaryColor }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setSaveError(data.error || "Failed to update");
      return;
    }
  }

  async function handleDeleteOrg(e) {
    e.preventDefault();
    if (deleteConfirm !== org.name) {
      setDeleteError("Name does not match");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/orgs/${org.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmName: deleteConfirm }),
    });
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(data.error || "Failed to delete");
      return;
    }
    window.location.href = "/";
  }

  if (!org) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <SettingsSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        {upgradedToast && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200 flex items-center justify-between">
            <span>You’ve been upgraded to Pro. Thanks!</span>
            <button
              type="button"
              onClick={() => setUpgradedToast(false)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Workspace settings</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Organization profile and danger zone.
            </p>
          </div>
          <Can permission="deleteOrg">
            <a 
              href="/dashboard/settings/audit" 
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              View Audit Logs
            </a>
          </Can>
        </section>

        <Can permission="updateOrg">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="font-medium text-zinc-200">Organization</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Update your workspace name and slug.
            </p>
            <form onSubmit={handleSaveOrg} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Brand Theme Color
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 p-1 outline-none"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    pattern="^#[0-9a-fA-F]{6}$"
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm uppercase text-zinc-50 outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              {saveError && (
                <p className="text-xs text-rose-400">{saveError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </Can>

        <Can permission="viewBilling">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm">
            <h2 className="font-medium text-zinc-200">Billing</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Current plan and subscription management.
            </p>
            {(() => {
              const plan = getPlan(org.plan);
              return (
                <div className="mt-4">
                  <p className="font-medium text-zinc-50">{plan.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {plan.price === 0 ? "Free" : `$${plan.price}/month`}
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-zinc-400">
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  {billingError && (
                    <p className="mt-2 text-xs text-rose-400">{billingError}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    {org.plan === "starter" ? (
                      <button
                        type="button"
                        disabled={billingLoading}
                        onClick={handleBillingCheckout}
                        className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {billingLoading ? "Loading..." : "Upgrade to Pro"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={billingLoading}
                        onClick={handleBillingPortal}
                        className="rounded-full border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
                      >
                        {billingLoading ? "Loading..." : "Manage Subscription"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        </Can>

        <Can permission="deleteOrg">
          <section className="rounded-2xl border border-rose-900/50 bg-zinc-900/60 p-6">
            <h2 className="font-medium text-rose-200">Danger zone</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Permanently delete this organization and all its data. This cannot
              be undone.
            </p>
            <form onSubmit={handleDeleteOrg} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Type <strong>{org.name}</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => {
                    setDeleteConfirm(e.target.value);
                    setDeleteError("");
                  }}
                  placeholder={org.name}
                  className="mt-1 w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 outline-none focus:border-rose-500"
                />
              </div>
              {deleteError && (
                <p className="text-xs text-rose-400">{deleteError}</p>
              )}
              <button
                type="submit"
                disabled={deleting || deleteConfirm !== org.name}
                className="rounded-full border border-rose-500 bg-transparent px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/50 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Organization"}
              </button>
            </form>
          </section>
        </Can>
      </div>
    </main>
  );
}
