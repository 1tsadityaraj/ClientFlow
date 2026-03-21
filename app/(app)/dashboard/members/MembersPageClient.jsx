"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Can } from "../../../../components/Can";
import { manageMember } from "@/actions/member";
import { useSession } from "next-auth/react";
import { Shield, Trash2, UserCog, CheckCircle2, LayoutGrid, Table2, MoreVertical, Edit2 } from "lucide-react";
import Modal from "../../../../components/Modal";
import Breadcrumb from "../../../../components/Breadcrumb";
import WorkloadView from "../../../../components/WorkloadView";

const ROLES = ["admin", "manager", "member", "client"];

const ROLE_BADGE = {
  admin: { bg: "var(--danger-light)", color: "var(--danger)" },
  manager: { bg: "var(--warning-light)", color: "var(--warning)" },
  member: { bg: "var(--accent-light)", color: "var(--accent)" },
  client: { bg: "rgba(56,189,248,0.1)", color: "var(--info)" },
};

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-100 dark:bg-zinc-100 dark:bg-zinc-900/40 px-4 py-3"
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
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [removeError, setRemoveError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "workload"

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    const [mRes, iRes] = await Promise.all([
      fetch("/api/members", { cache: "no-store" }),
      fetch("/api/invites", { cache: "no-store" }),
    ]);

    if (!mRes.ok || !iRes.ok) {
      setError("Failed to load members or invites");
      return;
    }

    const [mList, iList] = await Promise.all([mRes.json(), iRes.json()]);
    setMembers(Array.isArray(mList) ? mList : []);
    setInvites(Array.isArray(iList) ? iList : []);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadData().finally(() => setLoading(false));
  }, []);

  // ── Server Action: Change Role ──────────────────────────
  function handleRoleChange(memberId, newRole) {
    startTransition(async () => {
      const res = await manageMember(memberId, "UPDATE_ROLE", { role: newRole });
      if (res.success) {
        // Optimistically update UI
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
        showToast("Role updated");
      } else {
        showToast(res.error || "Failed to update role", "error");
      }
    });
  }

  const handleRemoveMember = async (memberId, memberName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from the workspace?\n\nThis action cannot be undone.`
    )
    if (!confirmed) return

    // Show loading state
    setRemovingId(memberId)

    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      // Remove from local state immediately (optimistic)
      setMembers(prev => prev.filter(m => m.id !== memberId))
      
      // Show success message
      setSuccessMessage(`${memberName} has been removed from the workspace`)
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      console.error('Remove error:', err)
      setRemoveError(err.message)
      setTimeout(() => setRemoveError(null), 5000)
    } finally {
      setRemovingId(null)
    }
  }

  async function handleCancelInvite(inviteId) {
    if (!confirm("Cancel this invitation?")) return;
    const res = await fetch(`/api/invites/${inviteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      showToast("Invite cancelled");
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-xl font-semibold">Members</h1>
          <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-secondary)" }}>
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
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-900 dark:text-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
            {error}
          </div>
        </div>
      </main>
    );
  }

  const isAdmin = session?.user?.role === "admin";
  const currentUserId = session?.user?.id;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Members</h1>
            <p style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-secondary)" }}>
              Manage your workspace roles and invites.
            </p>
          </div>
          <Can permission="inviteMembers">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
            >
              Invite Member
            </button>
          </Can>
        </div>

        {/* View Toggle */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "table"
                ? "bg-brand-primary/15 text-brand-primary border border-brand-primary/30"
                : "text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            Table
          </button>
          <button
            onClick={() => setViewMode("workload")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "workload"
                ? "bg-brand-primary/15 text-brand-primary border border-brand-primary/30"
                : "text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Workload
          </button>
        </div>

        {/* Banners */}
        {successMessage && (
          <div style={{
            background: 'rgba(34,211,160,0.1)',
            border: '1px solid rgba(34,211,160,0.25)',
            borderRadius: 8,
            padding: '10px 16px',
            color: '#22d3a0',
            fontSize: 13,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            ✓ {successMessage}
            <button onClick={() => setSuccessMessage(null)} 
              style={{ background: 'none', border: 'none', color: '#22d3a0', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {removeError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            padding: '10px 16px',
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 16,
          }}>
            ✗ {removeError}
          </div>
        )}

        {viewMode === "workload" ? (
          <div className="mt-6">
            <WorkloadView orgId={session?.user?.orgId} />
          </div>
        ) : (
        <>
        {/* Members Table */}
        <div style={{ marginTop: "24px", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "14px" }}>
            <thead style={{ borderBottom: "1px solid var(--border)", fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)" }}>
              <tr>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "left" }}>Member</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "center" }}>Role</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  m={m}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  isPending={isPending}
                  handleRoleChange={handleRoleChange}
                  handleRemoveMember={handleRemoveMember}
                  removingId={removingId}
                />
              ))}

              {/* Pending Invites */}
              {invites.map((i) => (
                <tr
                  key={i.id}
                  style={{ height: "52px", borderBottom: "1px solid var(--border)", transition: "background-color 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "0 16px", textAlign: "left" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed text-xs font-bold" style={{ borderColor: "var(--warning)", color: "var(--warning)", background: "var(--warning-light)" }}>
                        ?
                      </div>
                      <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>
                        Pending invite...
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: "0 16px", textAlign: "left", color: "var(--text-secondary)" }}>
                    <span>{i.email}</span>
                    <span style={{ marginLeft: "8px", borderRadius: "99px", padding: "2px 6px", fontSize: "10px", fontWeight: 600, color: "var(--warning)", background: "var(--warning-light)" }}>
                      Invited
                    </span>
                  </td>
                  <td style={{ padding: "0 16px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex", padding: "2px 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: "4px",
                        background: (ROLE_BADGE[i.role] || ROLE_BADGE.member).bg, color: (ROLE_BADGE[i.role] || ROLE_BADGE.member).color
                      }}
                    >
                      {i.role}
                    </span>
                  </td>
                  <td style={{ padding: "0 16px", textAlign: "right" }}>
                    <Can permission="inviteMembers">
                      <button
                        type="button"
                        onClick={() => handleCancelInvite(i.id)}
                        style={{ fontSize: "12px", color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                        className="hover:text-[var(--text-primary)]"
                      >
                        Cancel
                      </button>
                    </Can>
                  </td>
                </tr>
              ))}

              {members.length === 0 && invites.length === 0 && (
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
              loadData();
            }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 ${
              toast.type === "error"
                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast.message}
          </div>
        )}
        </>
        )}
      </div>
    </main>
  );
}

// ── Member Row ────────────────────────────────────────────
function MemberRow({
  m,
  currentUserId,
  isAdmin,
  isPending,
  handleRoleChange,
  handleRemoveMember,
  removingId,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isSelf = m.id === currentUserId;

  return (
    <tr
      style={{ height: "52px", borderBottom: "1px solid var(--border)", transition: "background-color 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      className="last:border-b-0 relative"
    >
      <td style={{ padding: "0 16px", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", height: "32px", width: "32px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--accent-light)", fontSize: "12px", fontWeight: "bold", color: "var(--accent)" }}>
            {m.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/dashboard/members/${m.id}`}
              style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", textDecoration: "none" }}
            >
              {m.name}
              {isSelf && (
                <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--text-muted)" }}>(you)</span>
              )}
            </Link>
          </div>
        </div>
      </td>
      <td style={{ padding: "0 16px", textAlign: "left", color: "var(--text-secondary)" }}>{m.email}</td>
      <td style={{ padding: "0 16px", textAlign: "center" }}>
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: "4px",
            background: (ROLE_BADGE[m.role] || ROLE_BADGE.member).bg, color: (ROLE_BADGE[m.role] || ROLE_BADGE.member).color
          }}
        >
          {m.role === "admin" && <Shield size={12} />}
          {m.role}
        </span>
      </td>
      <td style={{ padding: "0 16px", textAlign: "right" }}>
        {!isSelf ? (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-lg backdrop-blur-md">
                  {isAdmin && (
                    <div className="px-2 py-1.5 text-xs text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800 mb-1">
                      Edit Role
                    </div>
                  )}
                  {isAdmin && ROLES.map((r) => (
                    <button
                      key={r}
                      disabled={isPending}
                      onClick={() => {
                        handleRoleChange(m.id, r);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2 py-2 text-xs transition-colors ${
                        m.role === r
                          ? "bg-brand-primary/10 text-brand-primary font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <span className="capitalize">{r}</span>
                      {m.role === r && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                  ))}
                  <Can permission="manageMembers">
                    <button
                      disabled={removingId === m.id}
                      onClick={() => {
                        handleRemoveMember(m.id, m.name);
                        setDropdownOpen(false);
                      }}
                      className="mt-1 w-full flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {removingId === m.id ? "Removing..." : "Remove Member"}
                    </button>
                  </Can>
                </div>
              </>
            )}
          </div>
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
    </tr>
  );
}

// ── Invite Modal ──────────────────────────────────────────
function InviteModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

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
    setSuccessData(data);
  }

  if (successData) {
    const inviteUrl = `${window.location.origin}/invite/${successData.invite.token}`;
    return (
      <Modal open={true} onClose={() => onSuccess()} title="Invite Created!">
        <div className="space-y-4">
          {successData.devMode ? (
            <p className="text-sm text-yellow-400">
              ✅ Invite created! Email sending is disabled in dev mode. Share this link manually:
            </p>
          ) : !successData.emailSent ? (
            <p className="text-sm text-amber-400">
              Email delivery failed (likely due to unauthorized domain in Resend test mode), but you can manually share this link instead:
            </p>
          ) : (
            <p className="text-sm text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">
              An email has been sent to {successData.invite.email}. You can also share the link directly:
            </p>
          )}
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-brand-primary"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
                alert("Copied to clipboard!");
              }}
              className="rounded-lg bg-zinc-200 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => onSuccess()}
            className="w-full rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-700 dark:text-zinc-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-900 dark:text-zinc-50 outline-none transition-all focus:border-brand-primary"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
