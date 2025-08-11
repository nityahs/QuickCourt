import React, { useState } from 'react';
import TestModeBooking from './TestModeBooking';
import SimpleStripeTest from './SimpleStripeTest';

type TestMode = 'menu' | 'full-booking' | 'simple-stripe';

const TestLauncher: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TestMode>('menu');

  if (currentTest === 'full-booking') {
    return (
      <TestModeBooking 
        onBack={() => setCurrentTest('menu')}
        onComplete={() => {
          setCurrentTest('menu');
          alert('🎉 Full booking test completed!');
        }}
      />
    );
  }

  if (currentTest === 'simple-stripe') {
    return (
      <SimpleStripeTest 
        onBack={() => setCurrentTest('menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🧪</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QuickCourt Test Mode</h1>
            <p className="text-gray-600">Choose your Stripe integration test</p>
          </div>

          {/* Test Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Simple Stripe Test */}
            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Simple Stripe Test</h3>
              <p className="text-blue-700 text-sm mb-4">
                Quick test to verify your Stripe keys and basic integration without any backend dependencies.
              </p>
              <ul className="text-blue-600 text-xs space-y-1 mb-4">
                <li>✓ Tests Stripe connection</li>
                <li>✓ Validates card processing</li>
                <li>✓ No backend required</li>
                <li>✓ Quick diagnosis</li>
              </ul>
              <button
                onClick={() => setCurrentTest('simple-stripe')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium text-sm"
              >
                🚀 Quick Test
              </button>
            </div>

            {/* Full Booking Flow */}
            <div className="bg-green-50 rounded-lg p-6 text-left">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Full Booking Flow</h3>
              <p className="text-green-700 text-sm mb-4">
                Complete booking simulation with mock venues, courts, and full payment integration.
              </p>
              <ul className="text-green-600 text-xs space-y-1 mb-4">
                <li>✓ Complete booking flow</li>
                <li>✓ Sport-based filtering</li>
                <li>✓ Mock venue data</li>
                <li>✓ Full Stripe integration</li>
              </ul>
              <button
                onClick={() => setCurrentTest('full-booking')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium text-sm"
              >
                🎮 Full Test
              </button>
            </div>
          </div>

          {/* Test Card Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Test Card Numbers:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Success:</strong> <span className="font-mono bg-yellow-100 px-2 py-1 rounded">4242 4242 4242 4242</span></p>
              <p><strong>Declined:</strong> <span className="font-mono bg-yellow-100 px-2 py-1 rounded">4000 0000 0000 0002</span></p>
              <p><strong>3D Secure:</strong> <span className="font-mono bg-yellow-100 px-2 py-1 rounded">4000 0000 0000 3220</span></p>
              <p className="text-xs mt-2">Use any future date for expiry (e.g., 12/28), any 3-digit CVC (e.g., 123)</p>
            </div>
          </div>

          {/* Environment Check */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Environment Status:</h4>
            <div className="text-sm text-gray-600">
              <p className="flex items-center justify-center">
                <span className="text-green-500 mr-2">✓</span>
                Stripe Key: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Missing'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500">
            Test mode uses Stripe test environment and mock data
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestLauncher;
