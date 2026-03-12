"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Can } from "../../../../components/Can";

const ROLES = ["admin", "manager", "member", "client"];

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
        >
          <div className="h-4 w-24 rounded bg-zinc-700" />
          <div className="h-4 w-32 rounded bg-zinc-700" />
          <div className="h-4 w-16 rounded bg-zinc-700" />
        </div>
      ))}
    </div>
  );
}

export default function MembersPageClient() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);

  async function loadMembers() {
    const res = await fetch("/api/members", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load members");
      return;
    }
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadMembers().finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(memberId, newRole) {
    setRoleUpdating(memberId);
    const res = await fetch(`/api/members/${memberId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setRoleUpdating(null);
    if (res.ok) loadMembers();
  }

  async function handleRemove(memberId) {
    if (!confirm("Remove this member from the workspace?")) return;
    setRemoving(memberId);
    const res = await fetch(`/api/members/${memberId}`, {
      method: "DELETE",
    });
    setRemoving(null);
    if (res.ok) loadMembers();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your workspace roles and invites.
          </p>
          <div className="mt-6">
            <TableSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Members</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your workspace roles and invites.
            </p>
          </div>
          <Can permission="inviteMembers">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Invite Member
            </button>
          </Can>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-50">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{m.email}</td>
                  <td className="px-4 py-3">
                    <Can
                      permission="changeRoles"
                      fallback={
                        <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
                          {m.role}
                        </span>
                      }
                    >
                      <select
                        value={m.role}
                        disabled={roleUpdating === m.id}
                        onChange={(e) =>
                          handleRoleChange(m.id, e.target.value)
                        }
                        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </Can>
                  </td>
                  <td className="px-4 py-3">
                    <Can
                      permission="manageMembers"
                      fallback={<span className="text-zinc-500">—</span>}
                    >
                      <button
                        type="button"
                        disabled={removing === m.id}
                        onClick={() => handleRemove(m.id)}
                        className="text-rose-400 hover:text-rose-300 disabled:opacity-50"
                      >
                        {removing === m.id ? "Removing..." : "Remove"}
                      </button>
                    </Can>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-zinc-500"
                  >
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {inviteOpen && (
          <InviteModal
            onClose={() => setInviteOpen(false)}
            onSuccess={() => {
              setInviteOpen(false);
              loadMembers();
            }}
          />
        )}
      </div>
    </main>
  );
}

function InviteModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to send invite");
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Invite member</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
