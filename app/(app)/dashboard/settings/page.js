import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
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
