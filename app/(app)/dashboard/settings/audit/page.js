import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertPermission } from "../../../../../lib/permissions.js";
import { Clock, ArrowLeft } from "lucide-react";

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  try {
    assertPermission(session, "deleteOrg"); // Restrict audit logs to Admins only
  } catch {
    redirect("/dashboard/settings"); // Kick out non-admins
  }

  const logs = await prisma.auditLog.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { createdAt: "desc" },
    take: 100, // Show last 100 actions
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to settings
        </Link>
        
        <div className="mt-6 flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-primary" />
            Audit Logs
          </h1>
          <p className="text-sm text-zinc-400">
            A secure record of actions taken within your organization.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Entity</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">
                        {log.user?.name || "Unknown User"}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {log.user?.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4">
                      {log.metadata ? (
                        <pre className="max-w-[300px] overflow-hidden truncate text-[10px] text-zinc-500 whitespace-pre-wrap">
                          {log.metadata}
                        </pre>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
