import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YourStripePublishableKey');

interface SimpleStripeTestProps {
  onBack: () => void;
}

const SimpleStripePaymentForm: React.FC<{ onSuccess: () => void; onError: (error: string) => void }> = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      onError('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    if (!cardComplete) {
      onError('Please complete your card information');
      return;
    }

    setProcessing(true);

    try {
      // For test mode, we'll create a simple payment method to test the Stripe connection
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        console.log('Payment method created successfully:', paymentMethod);
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-white">
          <CardElement 
            options={cardElementOptions}
            onChange={(event) => setCardComplete(event.complete)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || !cardComplete}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Testing Stripe Connection...
          </div>
        ) : (
          '🧪 Test Stripe Connection'
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Use test card: <span className="font-mono bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Any future MM/YY (e.g., 12/28) and any CVC (e.g., 123)
        </p>
      </div>
    </form>
  );
};

const SimpleStripeTest: React.FC<SimpleStripeTestProps> = ({ onBack }) => {
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = () => {
    setTestResult('success');
  };

  const handleError = (error: string) => {
    setTestResult('error');
    setErrorMessage(error);
  };

  const renderContent = () => {
    if (testResult === 'success') {
      return (
        <div className="text-center">
          <div className="text-green-600 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">✅ Stripe Connection Successful!</h2>
          <p className="text-gray-600 mb-6">Your Stripe integration is working correctly.</p>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-800 font-medium">Test Results:</p>
            <ul className="text-green-700 text-sm mt-2 space-y-1">
              <li>✓ Stripe keys are valid</li>
              <li>✓ Card element loaded successfully</li>
              <li>✓ Payment method created</li>
              <li>✓ No integration errors</li>
            </ul>
          </div>
          
          <button
            onClick={onBack}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
          >
            Back to Test Menu
          </button>
        </div>
      );
    }

    if (testResult === 'error') {
      return (
        <div className="text-center">
          <div className="text-red-600 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">❌ Stripe Test Failed</h2>
          <p className="text-gray-600 mb-6">There was an issue with your Stripe setup.</p>
          
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-yellow-800 font-medium mb-2">Common Solutions:</p>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Check your VITE_STRIPE_PUBLISHABLE_KEY in .env</li>
              <li>• Ensure you're using test keys (pk_test_...)</li>
              <li>• Verify card number: 4242 4242 4242 4242</li>
              <li>• Use future date (e.g., 12/28) and any CVC</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setTestResult('pending');
                setErrorMessage('');
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Back to Test Menu
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">🧪 Simple Stripe Test</h2>
          <p className="text-gray-600">Test your Stripe connection without backend dependencies</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-800 mb-2">What this tests:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Stripe publishable key validity</li>
            <li>• Card element rendering</li>
            <li>• Payment method creation</li>
            <li>• Basic Stripe integration</li>
          </ul>
        </div>

        <SimpleStripePaymentForm onSuccess={handleSuccess} onError={handleError} />
        
        <button
          onClick={onBack}
          className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 mt-4"
        >
          Back to Test Menu
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

const SimpleStripeTestWrapper: React.FC<SimpleStripeTestProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <SimpleStripeTest {...props} />
    </Elements>
  );
};

export default SimpleStripeTestWrapper;
