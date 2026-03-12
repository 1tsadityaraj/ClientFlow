import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { stripe } from "../../../../lib/stripe.js";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export async function POST() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "viewBilling");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!stripe) {
    return Response.json(
      { error: "Billing is not configured" },
      { status: 503 }
    );
  }

  const org = await prisma.org.findUnique({
    where: { id: session.user.orgId },
  });

  if (!org?.stripeCustomerId) {
    return Response.json(
      { error: "No billing customer found" },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/settings`,
  });

  return Response.json({ url: portalSession.url });
}
