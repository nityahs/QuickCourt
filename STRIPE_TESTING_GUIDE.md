# 🧪 Stripe Payment Testing Guide for QuickCourt

## 🚀 Quick Setup Check

### 1. Verify Environment Variables
✅ **Server (.env)**: 
- `STRIPE_SECRET_KEY=sk_test_...` ✓ (Found)
- `STRIPE_PUBLISHABLE_KEY=pk_test_...` ✓ (Found)

✅ **Client (.env)**:
- `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` ✓ (Set)

### 2. Start Both Servers
```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend  
cd client
npm run dev
```

## 🎯 Testing Scenarios

### **Scenario 1: Successful Payment Flow**

1. **Navigate to Booking**:
   - Open http://localhost:5173
   - Login/Register if required
   - Select a venue and click "Book Court"

2. **Fill Booking Details**:
   - Select sport (e.g., Tennis)
   - Choose date (today or future)
   - Select time slot
   - Choose court
   - Click "Proceed to Payment"

3. **Test Successful Payment**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   Name: Any name
   ```
   - Enter the above test card details
   - Click "Pay ₹[amount]"
   - Should redirect to confirmation screen

### **Scenario 2: Declined Payment**

Use these test cards to simulate failures:

```bash
# Card Declined
Card: 4000 0000 0000 0002
Expected: "Your card was declined."

# Insufficient Funds
Card: 4000 0000 0000 9995  
Expected: "Your card has insufficient funds."

# Expired Card
Card: 4000 0000 0000 0069
Expected: "Your card has expired."

# CVC Check Failed
Card: 4000 0000 0000 0127
Expected: "Your card's security code is incorrect."
```

### **Scenario 3: 3D Secure Authentication**

```bash
# 3D Secure Required
Card: 4000 0000 0000 3220
Expected: Additional authentication popup
```

## 🔍 What to Monitor

### **Frontend Console Logs**
Open DevTools (F12) → Console tab:
```javascript
// Success logs you should see:
"Payment successful: pi_xxx"
"Booking confirmed"

// Error logs to watch for:
"Payment failed: [reason]"
"Network error"
```

### **Backend Console Logs**
Check terminal running server:
```bash
# Success logs:
"Payment intent created: pi_xxx"
"Payment verified successfully"
"Booking confirmed: [bookingId]"

# Error logs:
"Payment intent creation failed"
"Payment verification failed"
```

### **Network Tab (DevTools)**
Monitor API calls:
```http
POST /api/bookings/create-pending → 200 OK
POST /api/bookings/verify-payment → 200 OK
```

## 🐛 Common Issues & Solutions

### **Issue 1: "Stripe not loaded"**
**Solution**: Check if Stripe publishable key is correct in client `.env`

### **Issue 2: "PaymentIntent creation failed"**  
**Solution**: Verify server Stripe secret key in server `.env`

### **Issue 3: "Payment verification failed"**
**Solution**: Check network connectivity and server logs

### **Issue 4: Card input not showing**
**Solution**: Ensure `@stripe/react-stripe-js` is installed:
```bash
cd client
npm install @stripe/react-stripe-js
```

## 📱 Mobile Testing

Test on different screen sizes:
```bash
# Chrome DevTools
F12 → Toggle Device Toolbar → Select mobile device
```

## 🔄 Testing Workflow

### **Complete Test Run:**

1. **Book a court** with successful payment (4242 card)
2. **Try booking same slot** → Should show "already booked"
3. **Test failed payment** (0002 card) → Should return to payment form
4. **Test network failure** → Disconnect internet during payment
5. **Test concurrent bookings** → Two users booking same slot

## 📊 Stripe Dashboard Testing

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com/test
2. **Navigate to**: Payments → All payments
3. **Verify**: Test payments appear with correct amounts
4. **Check**: Payment status (succeeded/failed)

## 🎛️ Advanced Testing

### **Test with Stripe CLI** (Optional)
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Listen to webhooks
stripe listen --forward-to localhost:5001/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

### **Load Testing**
```javascript
// Simple concurrent booking test
for(let i = 0; i < 10; i++) {
  // Try booking same slot simultaneously
  // Only one should succeed
}
```

## ✅ Success Indicators

### **Frontend Success Signs:**
- Payment form loads without errors
- Card input accepts test numbers
- Success message appears after payment
- Booking appears in user's bookings list

### **Backend Success Signs:**
- PaymentIntent created in Stripe dashboard
- Booking status changes from 'pending' to 'confirmed'
- Time slot marked as unavailable for other users

### **Database Success Signs:**
```javascript
// Check MongoDB
db.bookings.find({status: 'confirmed'}).count()
db.timeslots.find({isBooked: true}).count()
```

## 🚨 Error Scenarios to Test

1. **Invalid card numbers** → Should show validation errors
2. **Expired cards** → Should show "card expired" error  
3. **Network interruption** → Should handle gracefully
4. **Server downtime** → Should show retry options
5. **Double booking prevention** → Second booking should fail

## 📝 Test Checklist

- [ ] Environment variables set correctly
- [ ] Both servers running
- [ ] Can navigate to booking page
- [ ] Booking form loads all fields
- [ ] Payment form renders with card input
- [ ] Successful payment with 4242 card
- [ ] Failed payment with 0002 card
- [ ] Payment appears in Stripe dashboard
- [ ] Booking confirmed in database
- [ ] Time slot marked as booked
- [ ] Confirmation screen shows correct details
- [ ] User can't book same slot again

## 🎉 Final Verification

**Complete End-to-End Test:**
1. Fresh browser session
2. Register new account
3. Book a court with real test card
4. Verify payment in Stripe dashboard
5. Check booking in user profile
6. Try booking same slot → Should fail

Your Stripe integration is working if all steps complete successfully! 🚀
