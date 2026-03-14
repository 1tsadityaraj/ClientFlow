import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const org = await prisma.org.findFirst({
    where: { id: session.user.orgId },
  });

  return (
    <Suspense fallback={null}>
      <SettingsForm
        org={
          org
            ? {
                id: org.id,
                name: org.name,
                slug: org.slug,
                plan: org.plan,
              }
            : null
        }
      />
    </Suspense>
  );
}
