import Stripe from "stripe";

let _stripe;

export const stripe = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    if (!_stripe) {
      _stripe = process.env.STRIPE_SECRET_KEY
        ? new Stripe(process.env.STRIPE_SECRET_KEY)
        : null;
    }
    return _stripe ? _stripe[prop] : null;
  }
});
