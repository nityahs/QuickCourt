Title: QuickCourt – Local Sports Booking (MERN) – Full Spec with Scoring, Pricing AI, and Owner Bargaining

Goal: Implement a production‑ready MERN app that lets users discover venues, book courts, and owners manage facilities. Include User, Facility Owner, Admin roles; OTP signup; venue discovery; single venue details; booking flow with simulated payment; My Bookings; owner dashboards & court/time-slot management; admin facility approvals & user moderation; and required charts. (Baseline features from the challenge: Home with popular venues/sports, venues list with filters/pagination, single venue details & “Book Now”, court booking with price/slot/confirm, profile, My Bookings cards & cancel, Owner dashboards & management, Admin approvals & stats—see PDF scope. Problem Statement 1 Problem Statement 1 Problem Statement 1 Problem Statement 1 Problem Statement 1 Problem Statement 1)

Stack & Cross‑cutting:

MERN: Node.js + Express API, MongoDB + Mongoose, React + Vite/Next (choose), Tailwind UI. JWT auth + OTP (email or SMS stub). Role-based middleware.

Realtime: Socket.io or Server‑Sent Events for live price/availability & bargaining.

Caching: Redis optional; else in‑memory LRU for price history and recommendations.

Observability: Basic request logger + error boundary + seed script.

Mobile‑first UI, clean + accessible; charts with Recharts (or Chart.js).

Data Freshness: Prices/slots update in near‑real‑time; weather polled every 30–60 min.

Compatibility: Works with your existing Mongo cluster + login/signup.

Core Entities (Mongo schemas – minimal fields, extend freely):

User { \_id, name, email, avatar, role: 'user'|'owner'|'admin', phone, otp, reliabilityScore, cancellations, ratingsGiven[], favorites[], calendarSync: {icsEnabled}, createdAt }

OwnerProfile { userId, orgName, kycStatus, payoutSim, highlightCredits }

Facility { \_id, ownerId, name, description, address, geolocation {lat,lng}, sports:[‘badminton’,…], amenities[], photos[], status:'pending'|'approved'|'rejected', ratingAvg, ratingCount, startingPricePerHour } (Home/Venues cards show name, sports, starting price, short location, rating; add filters + pagination. Problem Statement 1)

Court { \_id, facilityId, name, sport, pricePerHour, operatingHours:{open,close}, blockedSlots:[{start,end,reason}], isActive } (Owner can add/edit, set hours. Problem Statement 1)

TimeSlot { \_id, courtId, dateISO, start, end, isBlocked, isBooked, priceSnapshot } (Owner can block maintenance slots. Problem Statement 1)

Booking { \_id, userId, facilityId, courtId, dateISO, start, end, price, status:'confirmed'|'cancelled'|'completed', payment:{method:'simulated', txnId}, createdAt } (My Bookings cards show venue/sport/court/date/time/status + cancel action. Problem Statement 1)

Review { \_id, userId, facilityId, rating, text, createdAt }

Coupon { \_id, code, type:'flat'|'percent', value, minBookings, maxRedemptions, validFrom, validTo, createdBy }

PriceEvent { \_id, courtId, timestamp, price } (for min/max & trends)

Report { \_id, raisedBy, targetType:'facility'|'user', targetId, reason, status } (optional moderation. Problem Statement 1)

Required Screens / Flows (end‑to‑end):

Auth: Login, Signup (email/password/full name/avatar/role) + OTP step after signup. Problem Statement 1

User/Home: Banner/carousel, quick access, Popular Venues / Popular Sports sections. Problem Statement 1

Venues: List of approved facilities with filters (sport, price, venue type, rating) + pagination; cards show required fields. Problem Statement 1

Single Venue: Name/description/address, sports, amenities, about, gallery, reviews, Book Now. Problem Statement 1

Court Booking: Select court + slot, show price/total, confirm → simulate payment → redirect to My Bookings. Problem Statement 1

Profile (User & Owner): Show details with edit. Problem Statement 1 Problem Statement 1

My Bookings (User): Cards with venue/sport/court/date/time/status & Cancel if future; stats: Total Bookings, Active Courts (if owner), Earnings (sim), Calendar; add optional filters + charts (booking trends/earnings/peak hours). Problem Statement 1

Owner Dashboard: KPIs; Facility Management (name/location/desc/sports/amenities/photos); Court Management (name/sport/price/hours + edit/delete); Time Slot Management (set availability + block slots); Booking Overview (upcoming/past with status). Problem Statement 1 Problem Statement 1

Admin: Global stats; Facility Approval (pending list with details/photos, approve/reject with comments); User Management (search/filter by role/status, ban/unban, view booking history). Problem Statement 1 Problem Statement 1 Problem Statement 1

Your Unique Feature Set (implement all):

User Reliability Score R_user (0–100):

start at 80; −10 for late/frequent cancellations; +2 for each completed booking; +peer rating average×2; floor 0, cap 100. Show badge & use in recommendations & bargaining.

Court/Turf Quality Score Q_court (0–100):

based on ratingAvg (60%), review volume (20%, log-scaled), on-time rate (10%), complaint rate inverse (10%).

Price Recommendation (two‑sided):

Maintain last 90 days of PriceEvent per court; compute rolling min/max and P25/P50/P75; surface “Highest/Lowest price booked” + recommended bid/ask range for players/owners.

Owner Bargaining Option:

Users submit an offer within allowed band; owners get realtime queue of offers, accept/reject/counter; upon acceptance → booking locks slot & processes simulated payment.

Smart Recommendations:

Rank venues for a user by: similarity to past bookings, last‑week local prices vs current, weather‑aware desirability (indoor/outdoor), R_user compatibility, and Q_court.

Weather‑wise Pricing:

Outdoor courts: dynamic discount if heat/rain/wind above threshold; indoor: surge when outdoor weather is bad (configurable).

Loyalty Discounts:

If same court booked X times in Y days → auto‑apply coupon (stack rules configurable).

Coupon Generation:

Owner/admin can mint codes (flat/percent), with min bookings, validity, and redemption caps.

Google Maps Route:

Show route from user location to facility (map + directions link).

Add to Calendar:

Generate ICS on booking success; user can add to device calendar.

“Price Drop / Low Price” banner:

Global top bar that lights up when any favorite court drops below P25 or hits 7‑day low.

Sponsored Highlight:

Owners can spend highlightCredits to pin their facilities to top of list for N impressions.

APIs (Express): (prefix /api)

Auth: POST /auth/signup (OTP create), POST /auth/verify-otp, POST /auth/login, GET /auth/me

Facilities: GET /facilities?filters&pagination, GET /facilities/:id, POST /facilities (owner), PUT /facilities/:id, POST /facilities/:id/photos

Courts: GET /facilities/:id/courts, POST /courts (owner), PUT /courts/:id, DELETE /courts/:id

Slots: GET /courts/:id/slots?date=YYYY-MM-DD, POST /courts/:id/blocks, DELETE /blocks/:blockId

Bookings: POST /bookings (validates slot + price, sim payment), GET /bookings/me, PUT /bookings/:id/cancel, PUT /bookings/:id/complete

Bargain: POST /offers {courtId, date, start, end, offerPrice}, WS /offers/owner (subscribe), PUT /offers/:id/accept|reject|counter

Reviews: POST /reviews, GET /facilities/:id/reviews

Admin: GET /admin/facilities/pending, PUT /admin/facilities/:id/approve|reject, GET /admin/users, PUT /admin/users/:id/ban|unban

Coupons: POST /coupons, POST /coupons/validate

Metrics: GET /stats/user, GET /stats/owner, GET /stats/admin

Maps/Weather: GET /integrations/weather?lat&lng, GET /integrations/maps/link?dest=...

Calendar: GET /bookings/:id/ics (returns text/calendar)

Algorithms (concise):

Slot Atomicity: Booking creation uses transaction or “claim key” in Redis; mark TimeSlot.isBooked=true upon success; double‑submit safe.

R_user update on booking state change; Q_court recomputed nightly (cron or on update).

Price bands: compute from PriceEvent series (maintain min/max and quartiles).

Recommendation score S:
S = 0.35*Similarity(userPast, facility) + 0.2*PriceAdvantage + 0.15*WeatherBoost + 0.15*Q_court + 0.1*OwnerHighlight + 0.05*DistanceFactor

WeatherBoost: indoor courts get + if outdoor weather bad; outdoor get − (or discount) when extremes.

Charts (minimum to match scope):

User: Booking trends (line), Earnings summary (doughnut), Peak hours (heatmap). Problem Statement 1

Owner: Booking calendar + trends, earnings simulated, activity. Problem Statement 1

Admin: Booking activity over time, user registrations, facility approval trend, most active sports, earnings sim. Problem Statement 1

Non‑functional:

Access control per role on every route.

Validation with Zod/Joi.

Seeders for demo data.

Unit tests for booking atomicity & bargaining accept flow.

Deliverables:

Working MERN app with the above screens, APIs, and real‑time bargaining; demo script that shows: signup+OTP → browse → single venue → slot select → bargain accept → pay (sim) → ICS + Maps route → My Bookings → Owner dashboard → Admin approval → Price‑drop banner.
