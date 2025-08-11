import Stripe from 'stripe';

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YourStripeSecretKey', {
  apiVersion: '2023-10-16',
});

// Create Stripe payment intent
export const createStripePaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in smallest currency unit (paise for INR)
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
  }
};

// Confirm payment intent
export const confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to confirm Stripe payment: ${error.message}`);
  }
};

// Create Stripe checkout session
export const createStripeCheckoutSession = async (amount, currency = 'inr', successUrl, cancelUrl, metadata = {}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Court Booking',
              description: 'QuickCourt - Sports Court Booking',
            },
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

export default stripe;
