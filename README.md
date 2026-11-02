# INDIA TRIP — Ride Booking Platform

Tagline: **Your Ride, Your Way.**

A complete, production-oriented ride-booking platform with Customer App, Driver/Captain App, and Admin Dashboard, sharing a Firebase backend.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, RTDB, Storage, Functions, FCM, App Check)
- Google Maps Platform
- Razorpay (online payments)
- Zustand (state)

## Run
```bash
cp .env.example .env.local   # fill credentials (optional; demo mode otherwise)
npm install
npm run dev
# http://localhost:3000
```

## Demo credentials
- Customer login OTP: 1234 (any 10-digit phone)
- Driver login OTP: 1234
- Admin: admin@indiatrip.in / admin123

## Project structure
```
india-trip/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Role selector (home)
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css
│   │   ├── setup/page.tsx           # Production setup guide
│   │   ├── customer/                # Customer app
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Home: map, search, ride categories
│   │   │   ├── auth/page.tsx
│   │   │   ├── track/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── support/page.tsx
│   │   ├── driver/                  # Driver app
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── auth/page.tsx
│   │   │   ├── requests/page.tsx
│   │   │   ├── ride/page.tsx
│   │   │   ├── earnings/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── admin/                   # Admin dashboard
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── login/page.tsx
│   │       └── */page.tsx           # customers, drivers, vehicles, rides, bookings, fare, commission, payments, cash, offers, support, ratings, reports, notifications, settings
│   ├── components/
│   │   ├── ui/                      # Button, Card, Input, Badge, Logo
│   │   └── maps/MapView.tsx
│   ├── hooks/useLocationTracking.ts
│   ├── lib/                         # firebase, demo, fare, googleMaps, razorpay
│   ├── store/useAppStore.ts
│   └── types/index.ts
├── public/                          # manifest.json, icon.svg
├── firebase/
│   ├── firestore.rules
│   ├── realtime.rules.json
│   └── functions/                   # Cloud Functions
├── docs/SETUP.md
└── README.md
```

## Implemented features
- Customer: phone/OTP auth, home with map + search, Bike/Auto/Cab categories, fare calc, booking, driver assignment (demo), live tracking screen, 4-digit OTP verification, cash/online payment selection, ride history, profile, support.
- Driver: registration, online/offline, requests (live from demo bookings), active ride with OTP verification, earnings, profile.
- Admin: dashboard + 16 management modules (customers, drivers, vehicles, rides, bookings, fare, commission, payments, cash, offers, support, ratings, reports, notifications, settings).
- Real-time location tracking via browser geolocation + Firebase RTDB (when configured).
- Fare calculation engine (configurable, admin-managed).
- Demo mode when credentials missing (clearly labeled).

## Pending for production
- Wire Firebase Phone Auth, Firestore/RTDB persistence, Cloud Functions, FCM, App Check.
- Real Google Maps rendering with restricted API key.
- Razorpay order creation + signature verification (functions scaffolded).
- Server-side role verification for admin.
- PWA service worker + Android APK via Bubblewrap/PWABuilder.
- Security rules deployment.

See docs/SETUP.md for full setup.
```

Now let me make sure the dev server is still healthy after all changes (already rebuilt). It should be. Let me do a final check of dev server.<|end|><|start|>start<|channel|>shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
Invoke-WebRequest -Uri http://localhost:3000/customer -UseBasicParsing | Select-Object -ExpandProperty StatusCode