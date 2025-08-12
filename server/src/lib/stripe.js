import Stripe from 'stripe';

const RAW_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_YourStripeSecretKey';
const IS_PLACEHOLDER = RAW_KEY.includes('YourStripeSecretKey');

// Initialize Stripe instance (will still be constructed with placeholder but we'll short-circuit before real calls)
const stripe = new Stripe(RAW_KEY, { apiVersion: '2023-10-16' });

// Helper to create a mock payment intent for development when no real key present
const createMockPaymentIntent = (amount, currency, metadata) => {
  const id = 'pi_mock_' + Date.now();
  return {
    id,
    object: 'payment_intent',
    amount: amount * 100,
    currency,
    metadata,
    status: 'requires_payment_method',
    client_secret: `cs_test_${id}`
  };
};

// Create Stripe payment intent
export const createStripePaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  if (IS_PLACEHOLDER) {
    return createMockPaymentIntent(amount, currency, metadata);
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
  }
};

// Confirm payment intent
export const confirmStripePayment = async (paymentIntentId) => {
  if (IS_PLACEHOLDER || paymentIntentId.startsWith('pi_mock_')) {
    return { id: paymentIntentId, status: 'succeeded' };
  }
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to confirm Stripe payment: ${error.message}`);
  }
};

// Create Stripe checkout session
export const createStripeCheckoutSession = async (amount, currency = 'inr', successUrl, cancelUrl, metadata = {}) => {
  if (IS_PLACEHOLDER) {
    return { id: 'cs_mock_' + Date.now(), url: successUrl, status: 'mock', amount: amount * 100 };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Court Booking', description: 'QuickCourt - Sports Court Booking' },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
  }
};

export const isStripeConfigured = () => !IS_PLACEHOLDER;

export default stripe;
