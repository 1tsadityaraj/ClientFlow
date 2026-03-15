import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { stripe } from "@/lib/stripe.js";

const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
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

  if (!stripe || !STRIPE_PRO_PRICE_ID) {
    return Response.json(
      { error: "Billing is not configured" },
      { status: 503 }
    );
  }

  const orgId = session.user.orgId;
  let org = await prisma.org.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (!org.stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      email: session.user.email ?? undefined,
    });
    org = await prisma.org.update({
      where: { id: orgId },
      data: { stripeCustomerId: customer.id },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard/settings?upgraded=true`,
    cancel_url: `${baseUrl}/dashboard/settings`,
    customer: org.stripeCustomerId,
    metadata: {
      orgId: session.user.orgId,
    },
  });

  return Response.json({ url: checkoutSession.url });
}
