# Expense Tracker (React Native + Express)

![Revenue](/mobile/assets/images/revenue-i2.png)

Lightweight expense tracker with a React Native (Expo) frontend and an Express backend.

This repository contains two main folders:

- `backend/` — Express API (Node.js). PostgreSQL access via Neon in serverless mode. Rate-limiting via Upstash.
- `mobile/` — React Native (Expo) front-end using `expo-router` and `@clerk/clerk-expo` for auth.

Repository: https://github.com/adil162006/expense-tracker-react-native-app

---

**Quick copy**

```bash
# clone the repo
git clone https://github.com/adil162006/expense-tracker-react-native-app.git
cd expense-tracker-react-native-app
```

Then follow the instructions below for backend and mobile setup.

---

## Table of Contents
- Project overview
- Prerequisites
- Environment variables (backend & mobile)
- Backend: run locally
- Mobile: run locally (Expo)
- API endpoints & sample JSON (Postman)
- Dev notes: Android emulator, iOS simulator, real device
- Deploy notes: Neon, Clerk, Upstash
- Troubleshooting

---

## Project overview

- Backend exposes REST endpoints under `/api/transactions`.
- Mobile app calls these endpoints and uses Clerk for authentication.

Routes (backend `src/routes/transactionsRoute.js`):
- `GET /api/transactions/:userId` — list transactions for a user
- `POST /api/transactions` — create transaction
- `DELETE /api/transactions/:id` — delete transaction
- `GET /api/transactions/summary/:userId` — get balance / income / expenses summary
- `GET /api/health` — basic health check

---

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Expo CLI for mobile (`npm install -g expo-cli`) or use `npx expo` commands
- PostgreSQL hosted or Neon DB (serverless) connection string
- Clerk account (for auth) and a Publishable Key (test or pub)
- Upstash account if using rate-limits (optional)

---

## Environment variables

### Backend (`backend/.env`)
Create `backend/.env` with at least:

```dotenv
PORT=5001
DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
# (Optional) Upstash details if used by project
UPSTASH_REDIS_REST_URL=<your_upstash_rest_url>
UPSTASH_REDIS_REST_TOKEN=<your_upstash_token>
```

- `DATABASE_URL` is required (Neon / Postgres connection string). Example Neon docs: https://neon.tech/docs

### Mobile (`mobile/.env`)
Create `mobile/.env` with:

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...     # Clerk publishable key for client
```

Note: Expo exposes env vars prefixed with `EXPO_PUBLIC_` to the client. For local dev on device, consider setting API host via `mobile/constants/api.js` or `app.json` extra.

---

## Backend: Run locally

1. Install dependencies

```bash
cd backend
npm install
```

2. Create `.env` as above.

3. Start the server

```bash
npm run dev
# or
node src/server.js
```

You should see the server listening on `PORT` and you can hit the health endpoint:

```bash
curl http://localhost:5001/api/health
# expected: {"status":"ok"}
```

If `initDB()` fails (DB connection issues), check `DATABASE_URL` and ensure database is accessible.

---

## Mobile: Run locally (Expo)

1. Install dependencies

```bash
cd mobile
npm install
```

2. Put the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `mobile/.env`.

3. Decide API URL (where backend is reachable from device):

- Android emulator (Android Studio): `http://10.0.2.2:5001/api`
- iOS simulator: `http://localhost:5001/api`
- Real device on same Wi-Fi as your dev machine: `http://<YOUR_PC_LAN_IP>:5001/api` (replace with `ipconfig` IPv4)
- Remote backend: use full `https://...` URL (e.g., Render, Render URL)

Update `mobile/constants/api.js` accordingly. Example quick change for Android emulator:

```js
export const API_URL = "http://10.0.2.2:5001/api";
```

4. Start Expo

```bash
cd mobile
npx expo start
```

Open in the simulator or on your device (use LAN/tunnel as needed).

---

## API Endpoints & Sample JSON (for Postman)

Base URL: `http://<API_HOST>:5001/api` (set `API_HOST` per above)

1) Create transaction
- POST `/api/transactions`
- Body (JSON):

```json
{
  "user_id": "user123",
  "title": "Grocery Shopping",
  "amount": -50.25,
  "category": "Food"
}
```

2) Get transactions for a user
- GET `/api/transactions/:userId`
- Example: `/api/transactions/user123`

3) Delete transaction
- DELETE `/api/transactions/:id`

4) Get user summary
- GET `/api/transactions/summary/:userId`

Example responses are JSON objects/arrays. If the backend returns a non-JSON body, the mobile app has been hardened to show the response text instead of crashing.

---

## Tools used in this project

- Neon (Postgres serverless) — DB provider; set `DATABASE_URL` accordingly. Docs: https://neon.tech/docs
- Clerk (Auth) — `@clerk/clerk-expo` on the mobile side. Obtain `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from Clerk dashboard. Docs: https://clerk.com/docs
- Upstash (rate-limiting) — optional: used in `backend/src/config/upstash.js` and `middleware/rateLimiter.js` if configured.

---

## Deploy notes

- Backend: any Node hosting that supports Node 18+ works (Render, Fly, Railway, etc.). Make sure to set `DATABASE_URL` in the host environment variables and open port if needed. Prefer HTTPS for production.
- Mobile: build with EAS or publish via Expo. Replace Clerk test keys with production keys before release.

---

## Troubleshooting

- JSON parse errors like `Unexpected character: N` mean the app tried `response.json()` but the backend returned plain text or an HTML error page (or the network failed). Fixes:
  - Ensure `API_URL` points to the correct host reachable from your device/emulator (see platform notes above).
  - Check backend logs (`npm run dev`) to see if requests are arriving and whether errors occurred.
  - Use `curl` from host machine to test endpoints.

- For Android emulator, `localhost` refers to the emulator, not your host machine. Use `10.0.2.2` instead.

- Clerk auth issues: ensure the publishable key is provided to `ClerkProvider` in `mobile/app/_layout.jsx` (use `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`).

---

## Image `revenue-i2.png`

This README references `mobile/assets/images/revenue-i2.png`. Add the image at that path so it renders on GitHub. If you prefer to link a hosted image, replace the image path with an absolute URL.

---

## Contributing / Copying the repo

To copy and run locally:

```bash
git clone https://github.com/adil162006/expense-tracker-react-native-app.git
cd expense-tracker-react-native-app
# follow backend and mobile setup above
```

If you use Neon and Clerk in production, ensure to rotate keys and set correct production credentials (do NOT commit `.env` files).

---


