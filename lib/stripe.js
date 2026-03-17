import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const isPlaceholder = key?.includes("placeholder") || !key;

export const stripe = isPlaceholder ? null : new Stripe(key);

export const isStripeEnabled = () => !isPlaceholder;
