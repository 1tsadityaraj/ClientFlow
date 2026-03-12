export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    priceId: null,
    features: [
      "Up to 5 team members",
      "Unlimited client portals",
      "Projects, tasks, files, comments",
    ],
  },
  pro: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      "Unlimited team members",
      "Advanced RBAC & audit trails",
      "Priority support",
      "Stripe billing & Customer Portal",
    ],
  },
};

export function getPlan(planKey) {
  return PLANS[planKey] ?? PLANS.starter;
}
