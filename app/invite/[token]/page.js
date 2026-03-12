import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma.js";
import { auth } from "../../../lib/auth.js";
import InviteAcceptForm from "./InviteAcceptForm";

export default async function InvitePage({ params }) {
  const invite = await prisma.invite.findFirst({
    where: { token: params.token },
  });

  if (!invite) {
    return (
      <InviteStatusScreen message="This invite link is invalid." />
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <InviteStatusScreen message="This invite link has expired." />
    );
  }

  if (invite.acceptedAt) {
    return (
      <InviteStatusScreen message="This invite has already been used." />
    );
  }

  const session = await auth();

  if (session?.user?.email && session.user.email === invite.email) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          orgId: invite.orgId,
          role: invite.role,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });

    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-sm">
        <h1 className="text-lg font-semibold">
          You&apos;ve been invited
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Accept this invite to join the workspace as{" "}
          <span className="font-medium text-zinc-100">
            {invite.role}
          </span>
          .
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          Invited email:{" "}
          <span className="font-mono text-zinc-200">
            {invite.email}
          </span>
        </p>
        <InviteAcceptForm token={params.token} email={invite.email} />
      </div>
    </main>
  );
}

function InviteStatusScreen({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-sm">
        <p className="text-zinc-300">{message}</p>
      </div>
    </main>
  );
}

