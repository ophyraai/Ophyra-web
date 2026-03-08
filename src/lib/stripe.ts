import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const DIAGNOSIS_PRICE = 999; // 9.99€ in cents
export const DIAGNOSIS_CURRENCY = 'eur';
