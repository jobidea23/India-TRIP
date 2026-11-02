# INDIA TRIP — Setup & Deployment Guide

## 1. Prerequisites
- Node.js 18+
- npm
- Firebase CLI (`npm i -g firebase-tools`)
- Google Cloud account (Maps billing)
- Razorpay account

## 2. Install & Run
```bash
cd india-trip
cp .env.example .env.local
# fill env vars
npm install
npm run dev
# open http://localhost:3000
```

## 3. Firebase Setup
1. Create Firebase project.
2. Enable Authentication → Phone.
3. Create Firestore database (production mode).
4. Create Realtime Database.
5. Enable Storage.
6. Deploy rules: `firebase deploy --only firestore:rules,database`
7. Deploy functions: `cd firebase/functions && npm install && cd ../.. && firebase deploy --only functions`
8. (Optional) Enable FCM for push notifications.
9. Enable App Check.

## 4. Google Maps Setup
1. Create Google Cloud project, enable billing.
2. Enable APIs: Maps JavaScript, Places, Geocoding, Routes, Distance Matrix.
3. Create API key, restrict by HTTP referrer (your domain) and API.
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## 5. Razorpay Setup
1. Create Razorpay account, get key_id & key_secret.
2. Set key_id in `.env.local` as `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
3. Set key_secret in Firebase Functions config: `firebase functions:config:set razorpay.key_id="..." razorpay.key_secret="..."`.
4. Redeploy functions.

## 6. Build & Deploy
```bash
npm run build
# Deploy to Vercel / Netlify / Firebase Hosting
firebase deploy --only hosting
```

## 7. Android APK (PWA → APK)
Use Bubblewrap / PWABuilder with the manifest at /manifest.json and icon /icon.svg.

## 8. Collections
users, drivers, vehicles, bookings, driverLocations, payments, transactions, ratings, complaints, offers, fareSettings, notifications, adminUsers.

## 9. Google Maps API Key (FREE)
1. Go to https://console.cloud.google.com and sign in with Google account.
2. Create a new project (e.g. "India Trip").
3. Enable billing (required, but you get $200 free credit/month; Maps JS is free up to 28k loads/month).
4. APIs & Services → Library → enable:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Routes API (or Directions API)
   - Distance Matrix API
5. APIs & Services → Credentials → Create Credentials → API Key.
6. (Important) Restrict the key:
   - Application restrictions: HTTP referrers → add your domain (e.g. http://localhost:3000/* and https://yourdomain.com/*).
   - API restrictions: restrict to the APIs above.
7. Copy the key into .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
8. Restart dev server.

Free tier: $200/month credit covers ~28,000 map loads and ~40,000 geocoding requests. For development it's effectively free.

## 10. Demo Mode
When Firebase/Maps credentials are missing, the app runs in demo mode with in-memory data and simulated flows. Demo OTP for customer login and ride verification is `1234`. Admin demo credentials: admin@indiatrip.in / admin123.
```

Now let me try to build to verify compilation.<|end|><|start|>start<|channel|>shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd "C:\Users\brajb\OneDrive\Documents\Default Project\india-trip"; npm run build 2>&1 | Select-Object -Last 40