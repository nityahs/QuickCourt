<div align="center">
	<h1>QuickCourt</h1>
	<p><strong>Book, manage, and optimize sports courts – with real‑time availability, dynamic pricing, negotiations, and multi‑role workflows.</strong></p>
	<p>
		<em>Modern MERN + Realtime + Payments (Stripe & Razorpay) + OTP Auth + Facility Owner & Admin consoles.</em>
	</p>
</div>

## Table of Contents
1. Overview
2. Feature Highlights
3. Architecture
4. Tech Stack
5. Local Development Setup
6. Environment Variables
7. Running the Apps (Client & Server)
8. Domain Model Glossary
9. API Surface (High Level)
10. Realtime & Sockets
11. Payments (Stripe / Razorpay)
12. OTP & Auth Flow
13. Theming & UI
14. Quality / Security Notes
15. Roadmap & Ideas

---

## 1. Overview
QuickCourt is a full‑stack platform for discovering sports facilities, booking time slots on individual courts, negotiating offers, and managing operations. It supports three primary roles:
- End Users: search venues, book courts, negotiate offers, review facilities.
- Facility Owners: manage facilities, courts, pricing, availability, slots, bookings, and performance dashboards.
- Admins: approve/reject facilities, manage users, oversee platform stats.

## 2. Feature Highlights
User / Core:
- Search & view facilities (map + list) with geolocation & pricing.
- Court booking with real-time slot availability.
- Price negotiation (offer / counter / accept / reject) flow.
- Reviews & ratings.
- OTP email verification (blocking login until verified).

Facility Owner:
- Facility CRUD & approval workflow.
- Court management (sport type, per‑hour pricing, operating hours).
- Availability calendar & slot blocking / unblocking.
- KPI dashboard (earnings, utilization, revenue charts, sport mix, hourly distribution).
- Recent booking activity feed.

Admin:
- Facility approval queue.
- User management (ban/unban, view bookings).
- Platform metrics (via stats routes).

Payments:
- Stripe integration (with mock fallback if placeholder key).
- Razorpay flow for INR (booking -> pending -> payment -> confirmation).
- Graceful mock mode for development without live keys.

Realtime:
- Socket.io initialized server-side (room/event scaffolding ready for live updates: bookings, offers, notifications).

Security & UX:
- JWT-based auth (role encoded) with route protections.
- OTP enforced before first login.
- Helmet, CORS whitelisting with LAN dev allowances.
- Geospatial indexing for future proximity queries (Mongo 2dsphere).

## 3. Architecture
Monorepo (two main packages):
```
root/
	client/   -> Vite + React + TS front-end
	server/   -> Express + Mongoose + Socket.io backend
```

Runtime flow (booking example):
1. User selects facility & court -> fetches /api/slots for availability.
2. User books (status=pending) via /api/bookings.
3. Payment intent/order created (Stripe or Razorpay).
4. Payment success callback -> booking status becomes confirmed.
5. Realtime / dashboards update (future: via sockets events).

## 4. Tech Stack
Front-end: React 18, TypeScript, Vite, Tailwind, Framer Motion, Leaflet (maps), Recharts / Chart.js, Socket.io-client.
Back-end: Node.js, Express, Mongoose (MongoDB), Socket.io, Stripe, Razorpay, Nodemailer, Helmet, CORS, Morgan.
Auth: JWT + OTP (email) verification.
Styling: Tailwind + custom CSS variables (theme aware: light / dark / colorblind).

## 5. Local Development Setup
Prerequisites: Node 18+, npm, MongoDB (Atlas or local), Stripe & optionally Razorpay credentials, an email SMTP (for OTP) or a dev mail trap.

Clone & install:
```
git clone <repo-url>
cd QuickCourt
npm install          # root (if needed – minimal deps)
cd client && npm install
cd ../server && npm install
```

## 6. Environment Variables
Create `.env` in root and/or `server/.env` (depending on how you load them). Keys used:
```
# Server
PORT=5000
HOST=0.0.0.0
MONGO_URI=mongodb+srv://...
MONGO_DBNAME=quickcourt
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=supersecret_jwt_key
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=rzp_test_secret
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=QuickCourt <no-reply@yourdomain.com>
FACILITIES_COLLECTION=facilities

# Client (vite) -> client/.env
VITE_API_BASE=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```
Notes:
- If STRIPE_SECRET_KEY contains 'YourStripeSecretKey' a mock mode is used (no live calls).
- Ensure CORS CLIENT_ORIGIN matches the dev port (5173).

## 7. Running the Apps
Server (dev):
```
cd server
npm run dev
```
Client (dev):
```
cd client
npm run dev
```
Visit http://localhost:5173.

Build client:
```
cd client
npm run build
```

## 8. Domain Model Glossary
User: { name, email, role(user|owner|admin), passwordHash, otp, otpVerified, banned? }
Facility: Owner-managed venue, includes geolocation (2dsphere), sports, amenities, startingPricePerHour, approval status.
Court: Individual playable unit under a facility (pricePerHour, sport, operating hours).
TimeSlot: Derived/queried availability (start/end, isBooked, isBlocked, priceSnapshot).
Booking: Ties user → facility → court for a date + time range; status lifecycle (pending → confirmed / cancelled / completed) + payment metadata.
Offer: Negotiation object with originalPrice, offeredPrice, counterPrice, status (pending/accepted/rejected/countered).
Review: User feedback (rating + comment) referencing facility.
Coupon: Promotional discount logic (not fully enumerated here).

## 9. API Surface (High Level)
Base: `/api`.
- Auth: `/auth/signup`, `/auth/login`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/me`, `/auth/change-password`, `/auth/profile`.
- Facilities: CRUD + approval (admin) via `/facilities`, `/admin/facilities`.
- Courts: `/courts`, `/facility-owner/courts`, `/facility-owner/facilities`.
- Slots: `/slots/:courtId?date=YYYY-MM-DD` for availability.
- Bookings: `/bookings` (create/list), updates & payment linking.
- Offers: negotiation endpoints `/offers` (stats, accept, reject, counter).
- Reviews: `/reviews/facility/:id`.
- Coupons: `/coupons`.
- Stats: `/stats` aggregated KPIs.
- Integrations: `/integrations` (payments etc.).
- Admin: `/admin/users`, facility decisions, user bookings.
- Debug: `/debug` (internal/dev utilities).

Authentication: Bearer token (JWT) in `Authorization` header.
Errors: JSON `{ error: string, code?: string }` with appropriate status.

## 10. Realtime & Sockets
`initSocket(server)` sets up Socket.io; room/event binding expandable for:
- Live booking status updates.
- Offer negotiation push.
- Facility approval notifications.
(Future work: currently minimal scaffolding, expand as needed.)

## 11. Payments
Stripe:
- `createStripePaymentIntent()` with automatic fallback to mock mode when placeholder key used.
- Supports both Payment Intent & Checkout Session flows.

Razorpay:
- Dedicated booking flow (client component `BookingFormRazorpay.tsx`).
- Amounts in INR (paise on server side *100 conversions).

Development Tips:
- Use test mode keys; ensure currency is set to `inr` consistently.
- Mock IDs prefixed with `pi_mock_` for Stripe.

## 12. OTP & Auth Flow
1. Signup -> user created with `otp`, `otpExpiresAt`, `otpVerified=false`.
2. Email OTP sent (Nodemailer) – must match stored value.
3. User enters OTP -> `/verify-otp` verifies & returns JWT.
4. Login blocked until verification (returns `code: OTP_REQUIRED`).

Resend: `/resend-otp` regenerates OTP (invalidate old), 10‑minute expiration.

## 13. Theming & UI
CSS variables define theme layers: light, dark, colorblind. Applied via root class (`dark-theme`, `colorblind-theme`). Utility classes override palette (e.g., `.bg-white` resolved to card background variable). Framer Motion used for modals & micro-interactions. Leaflet + custom div markers for map pins. Components segmented by domain (Auth, Booking, FacilityOwner, Venues, Admin, etc.).

## 14. Quality / Security Notes
- Helmet for headers, strict CORS whitelist with LAN dev fallback.
- Mongo injection mitigated via Mongoose schemas.
- JWT secret must be strong & rotated for production.
- Rate limiting & brute force protection (TODO – consider express-rate-limit & login throttling).
- Input validation: lightweight custom `required()` util; can enhance with Zod/Yup.
- File uploads not yet implemented (only photo URLs) – add sanitization if enabling uploads.

## 15. Roadmap & Ideas
- Add full focus trap & ARIA enhancements to all modals.
- Add refresh token + short-lived access token model.
- Implement dynamic pricing engine (time-of-day, demand).
- Real geospatial search & radius filtering.
- Push notifications / email summaries for owners.
- Owner analytics (heatmaps, retention, cancellation reasons).
- CI pipeline (lint, type check, test) + containerization.
- E2E tests (Playwright or Cypress).

---
## Quick Start (TL;DR)
```
# Backend
cp server/.env.example server/.env   # (create if you add an example file)
cd server && npm run dev

# Frontend
cd ../client && npm run dev
```
Open http://localhost:5173 and create an account (check terminal for OTP email logs if using dev SMTP placeholder).

---
## Contributing
1. Fork / branch.
2. Feature / fix with focused commits.
3. Run lint & build.
4. Open PR with context (screenshots for UI changes helpful).

## License
Currently unlicensed / private (add a LICENSE file to clarify usage & distribution rights).

---
Feel free to request additions (detailed API spec, ER diagram, Postman collection, or deployment guide) and they can be appended here.
