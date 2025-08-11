# QuickCourt Test Mode - Stripe Payment Testing

🧪 **Test Mode Created Successfully!**

## How to Access

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173/test
   ```

## What This Tests

✅ **Complete Booking Flow**
- Mock venue and court selection
- Sport-based filtering
- Date and time slot selection
- Duration selection
- Price calculation

✅ **Stripe Payment Integration**
- Secure Stripe Elements integration
- Test card processing
- Payment confirmation flow
- Error handling

✅ **Mock Data Simulation**
- No database dependencies
- Realistic venue/court data
- Complete booking flow without real data

## Test Cards (Stripe Test Mode)

| Card Number | Purpose | Result |
|-------------|---------|---------|
| `4242 4242 4242 4242` | Success | Payment succeeds |
| `4000 0000 0000 0002` | Declined | Card declined |
| `4000 0000 0000 3220` | 3D Secure | Requires authentication |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any billing ZIP (e.g., 12345)

## Features Tested

🎯 **Booking System**
- Sport selection dropdown
- Available time slots
- Court pricing
- Duration calculation

🔒 **Payment Processing**
- Stripe payment intent creation
- Secure card input with Stripe Elements  
- Payment confirmation
- Error handling and validation

📊 **UI/UX Flow**
- Multi-step booking process
- Payment form integration
- Success/failure states
- Mobile-responsive design

## Mock Data Included

- **2 Test Venues** (Sports Complex & Fitness Center)
- **4 Mock Courts** (Football, Basketball, Tennis, Badminton)
- **17 Time Slots** (6:00 AM - 10:00 PM)
- **Test User Profile**

## Environment Variables Required

Make sure your `.env` file in the client folder has:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

And your server `.env` has:
```
STRIPE_SECRET_KEY=sk_test_...
```

## Usage Instructions

1. **Launch Test Mode**: Click "🚀 Launch Test Mode"
2. **Select Options**: Choose sport, date, time, and duration
3. **Book Court**: Click "Test Stripe Payment"
4. **Enter Test Card**: Use `4242 4242 4242 4242`
5. **Complete Payment**: Follow the payment flow
6. **View Confirmation**: See success message

## Troubleshooting

**❌ Payment fails?**
- Check Stripe keys are configured
- Verify using test card numbers
- Check browser console for errors

**❌ Route not found?**
- Ensure frontend server is running on port 5173
- Navigate to exactly `http://localhost:5173/test`

**❌ Mock data not loading?**
- Check browser console
- Verify all files were created correctly

## Success Indicators

When everything works correctly, you'll see:
- ✅ Booking form with sport selection
- ✅ Stripe payment form loads
- ✅ Test card processes successfully  
- ✅ Payment confirmation appears
- ✅ No console errors

**🎉 Your Stripe integration is fully functional!**
