# Stripe Payment Gateway Integration

## Overview
This document describes the complete Stripe payment gateway integration for QuickCourt booking system, replacing the previous Razorpay integration.

## Architecture

### Frontend (React + TypeScript)
- **Main Component**: `BookingForm.tsx` - Multi-step booking flow
- **Payment Component**: `StripePaymentForm.tsx` - Stripe Elements integration
- **Dependencies**: `@stripe/stripe-js`, `@stripe/react-stripe-js`

### Backend (Node.js + Express)
- **Payment Library**: `stripe.js` - Server-side Stripe integration
- **API Endpoints**: Enhanced booking routes with Stripe payment intents
- **Dependencies**: `stripe` npm package

## Payment Flow

### 1. Booking Creation
```
User selects court → POST /api/bookings/create-pending
├── Creates pending booking in database
├── Creates Stripe PaymentIntent
└── Returns clientSecret for payment
```

### 2. Payment Processing
```
User enters card details → Stripe Elements → confirmCardPayment()
├── Stripe processes payment securely
├── Returns payment status
└── Calls onSuccess/onError handlers
```

### 3. Payment Verification
```
Frontend confirms payment → POST /api/bookings/verify-payment
├── Verifies PaymentIntent status with Stripe
├── Updates booking status to 'confirmed'
└── Marks time slot as booked
```

## Key Components

### BookingForm.tsx
```typescript
// Multi-step flow: booking → payment → confirmation
const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>('booking');

// Stripe payment integration
const handleStripePayment = async (paymentIntentId: string) => {
  await handlePaymentSuccess(paymentIntentId);
};
```

### StripePaymentForm.tsx
```typescript
// Secure card collection using Stripe Elements
<CardElement options={{ style: { base: { fontSize: '16px' } } }} />

// Payment confirmation
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

### Server Routes
```javascript
// Create payment intent
const paymentIntent = await createStripePaymentIntent(amount, 'inr', metadata);

// Verify payment
const paymentIntent = await confirmStripePayment(paymentIntentId);
```

## Configuration

### Environment Variables

**Server (.env)**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_YourStripePublishableKey
STRIPE_SECRET_KEY=sk_test_YourStripeSecretKey
```

**Client (.env)**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YourStripePublishableKey
```

### Stripe Dashboard Setup
1. Create Stripe account
2. Get API keys from Dashboard → Developers → API keys
3. Configure webhooks (optional)
4. Set up payment methods (cards, wallets, etc.)

## Database Schema

### Updated Booking Model
```javascript
payment: { 
  method: { type: String, default: 'stripe' }, 
  txnId: String,              // PaymentIntent ID
  paymentIntentId: String,    // Stripe PaymentIntent ID
  clientSecret: String,       // For frontend payment confirmation
  status: String,             // Payment status from Stripe
  amount: Number              // Amount in original currency
}
```

## Security Features

### 1. PCI Compliance
- Stripe handles all sensitive card data
- No card details stored on our servers
- Stripe Elements ensures secure card input

### 2. Payment Verification
- Server-side PaymentIntent confirmation
- Automatic fraud detection by Stripe
- Webhook verification (optional)

### 3. Booking Integrity
- Atomic booking creation and payment
- Time slot locking during payment
- Automatic cleanup of failed payments

## API Endpoints

### POST /api/bookings/create-pending
**Request:**
```json
{
  "court": "courtId",
  "date": "2024-01-15",
  "startTime": "10:00",
  "duration": 2,
  "amount": 1000
}
```

**Response:**
```json
{
  "booking": { ... },
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "message": "Pending booking created successfully"
}
```

### POST /api/bookings/verify-payment
**Request:**
```json
{
  "bookingId": "bookingId",
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ... },
  "message": "Payment verified and booking confirmed"
}
```

## Error Handling

### Frontend
- Card validation errors from Stripe Elements
- Network failure handling with retry logic
- User-friendly error messages
- Graceful fallback to booking step

### Backend
- Stripe API error handling
- Database transaction rollbacks
- Detailed error logging
- Appropriate HTTP status codes

## Testing

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995
- **3D Secure**: 4000 0000 0000 3220

### Test Scenarios
1. Successful payment flow
2. Card declined scenarios
3. Network failure recovery
4. Concurrent booking attempts
5. Payment timeout handling

## Production Deployment

### Pre-launch Checklist
- [ ] Replace test keys with live keys
- [ ] Configure webhooks for payment status updates
- [ ] Set up monitoring for payment failures
- [ ] Test with real bank cards
- [ ] Enable fraud detection rules
- [ ] Configure currency and locale settings

### Monitoring
- Payment success/failure rates
- Average payment completion time
- Common error patterns
- Booking conversion metrics

## Currency Support
- Primary: INR (Indian Rupees)
- Stripe supports 135+ currencies
- Easy to extend for international markets
- Automatic currency conversion

## Benefits Over Razorpay

### 1. Global Reach
- Stripe available in 45+ countries
- Better international card support
- Multi-currency processing

### 2. Developer Experience
- Superior documentation
- Better error handling
- More robust webhook system

### 3. Security
- Industry-leading fraud detection
- Built-in PCI compliance
- Advanced 3D Secure support

### 4. Features
- Subscription billing ready
- Mobile wallet support (Apple Pay, Google Pay)
- Bank transfer support in many countries

## Migration from Razorpay

### Database Migration
1. Update existing bookings with new payment schema
2. Preserve transaction history
3. Add status mapping for old bookings

### Configuration Update
1. Replace Razorpay keys with Stripe keys
2. Update webhook endpoints
3. Test payment flow thoroughly

### Backward Compatibility
- Old booking data preserved
- Both payment methods can coexist during transition
- Gradual rollout possible

## Support and Documentation
- [Stripe Documentation](https://stripe.com/docs)
- [React Stripe.js](https://stripe.com/docs/stripe-js/react)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## Conclusion
The Stripe integration provides a more robust, secure, and scalable payment solution for QuickCourt. With better international support, superior developer tools, and enhanced security features, it positions the platform for future growth and expansion.
