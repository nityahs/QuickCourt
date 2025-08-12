import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YourStripePublishableKey');

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  isSubmitting
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string>('');

  const isMockClientSecret = clientSecret?.startsWith('cs_test_pi_mock_');
  const isPlaceholderKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YourStripePublishableKey').includes('YourStripePublishableKey');

  // If using mock payment intent & placeholder key, bypass Stripe confirmation entirely
  useEffect(() => {
    if (isMockClientSecret && isPlaceholderKey) {
      // Auto succeed without user card entry
      onSuccess(clientSecret.replace('cs_test_', '').split('_secret')[0] || 'pi_mock');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMockClientSecret, isPlaceholderKey, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isMockClientSecret && isPlaceholderKey) {
      // Already handled via useEffect auto success; guard double submit
      return;
    }

    if (!stripe || !elements) {
      setLocalError('Payment service not ready yet.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setLocalError(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent) {
        setLocalError(`Unexpected status: ${paymentIntent.status}`);
      }
    } catch (err: any) {
      const msg = err.message || 'Payment failed';
      setLocalError(msg);
      onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isMockClientSecret && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="bg-white p-3 rounded border">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {localError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {localError}
        </div>
      )}

      <button
        type="submit"
        disabled={(!stripe && !isMockClientSecret) || processing || isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium flex items-center justify-center space-x-2"
      >
        <span>💳</span>
        <span>
          {isMockClientSecret && isPlaceholderKey
            ? 'Auto-confirming (Dev Mode)...'
            : (processing || isSubmitting ? 'Processing...' : `Pay ₹${amount}`)}
        </span>
      </button>
    </form>
  );
};

interface StripePaymentWrapperProps extends Omit<StripePaymentFormProps, 'isSubmitting'> {
  isSubmitting: boolean;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentWrapper;
