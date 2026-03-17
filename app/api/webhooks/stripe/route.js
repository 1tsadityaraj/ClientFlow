export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, isStripeEnabled } from "@/lib/stripe.js";
import { prisma } from "@/lib/prisma.js";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  if (!isStripeEnabled() || !webhookSecret) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let body;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = /** @type {Stripe.Checkout.Session} */ (event.data.object);
      const orgId = session.metadata?.orgId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (orgId && subscriptionId) {
        await prisma.org.update({
          where: { id: orgId },
          data: {
            plan: "pro",
            stripeSubscriptionId: subscriptionId,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = /** @type {Stripe.Subscription} */ (event.data.object);
      await prisma.org.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: "starter",
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
