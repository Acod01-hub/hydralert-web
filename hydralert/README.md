# 💧 HydrAlert

> **Know before you're thirsty.** — Dehydration risk prediction for everyday people.

HydrAlert is a full-stack web application that predicts your personal dehydration risk by combining your health profile, recent water intake, activity level, and live local weather data. It delivers a clear risk score (0–100), a color-coded alert, and an actionable recommendation — so you drink the right amount at the right time.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Privacy & Data Handling](#privacy--data-handling)
- [For Judges](#for-judges)
- [60-Second Demo Script](#60-second-demo-script)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Risk Scoring** | ML microservice computes dehydration risk 0–100 from profile + intake + weather |
| **Color-coded Alerts** | Green / Yellow / Red badge with exact ml recommendation |
| **Weather Integration** | OpenWeatherMap proxy with 5-minute caching; falls back gracefully |
| **Hydration Logging** | One-tap quick-log buttons (150, 250, 500, 750 ml) + custom amount |
| **7-Day Chart** | Visual intake trend with daily goal line |
| **Streak Counter** | Consecutive days meeting your water goal |
| **Caregiver Mode** | Monitor up to 5 dependents (elderly, children) in read-only dashboards |
| **User Auth** | JWT-based sign-up / login / logout; bcrypt password hashing |
| **Data Export** | Download all personal data as JSON |
| **Demo Accounts** | 3 pre-seeded personas: Eleanor (elderly), Marcus (athlete), Sarah (parent) |

---

## 🛠 Tech Stack

**Frontend:** React 18 · Vite · TailwindCSS · React Router v6 · Axios · Chart.js

**Backend:** Node.js · Express · Mongoose · JWT · bcryptjs · express-validator · node-cache

**Database:** MongoDB (Mongoose schemas)

**ML Scoring:** Flask microservice — deterministic formula (plug in a trained model by replacing one function)

**External APIs:** OpenWeatherMap (current temp & humidity, free tier)

**Testing:** Jest + Supertest (backend) · Vitest + React Testing Library (frontend)

**Deployment:** Docker Compose · Vercel (frontend) · Render (backend)

---

## 🗂 Project Structure

```
hydralert/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/        # NavBar, RiskBadge, IntakeButtons, WeatherCard, LogsTable, LineChart
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Profile, Caregiver, Settings
│   │   ├── tests/             # Component tests (Vitest + RTL)
│   │   └── utils/api.js       # Axios instance with JWT interceptor
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── models/            # User.js, Log.js (Mongoose schemas)
│   │   ├── routes/            # auth, users, logs, score, caregivers, weather, demo
│   │   ├── middleware/auth.js  # JWT protect + signToken
│   │   ├── seed.js            # Demo data seeder
│   │   └── index.js           # App entry point
│   └── tests/api.test.js      # Jest + Supertest endpoint tests
│
├── ml-service/                # Flask scoring microservice
│   ├── app.py                 # Deterministic formula — replace with trained model here
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+ (for ML service)
- MongoDB running locally (or use MongoDB Atlas)

### 1. Clone & install

```bash
git clone https://github.com/your-org/hydralert.git
cd hydralert

# Install root dev tools
npm install

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..

# Install ML service
cd ml-service && pip install -r requirements.txt && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
MONGO_URI=mongodb://localhost:27017/hydralert
JWT_SECRET=your_random_secret_here
OPENWEATHER_KEY=your_openweather_key   # optional — demo values used if missing
```

### 3. Seed demo data

```bash
npm run seed
```

This creates 4 demo users with 14 days of realistic hydration logs.

### 4. Start all services

```bash
npm run dev
```

This runs frontend (port 5173), backend (port 5000), and ML service (port 5001) concurrently.

Open http://localhost:5173 in your browser.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Random secret for JWT signing |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime (e.g. `7d`) |
| `PORT` | — | Backend port (default: `5000`) |
| `OPENWEATHER_KEY` | — | Free tier key from openweathermap.org |
| `ML_SERVICE_URL` | — | ML service base URL (default: `http://localhost:5001`) |
| `VITE_API_URL` | — | Frontend API base URL (default: `/api`) |

---

## 🎭 Demo Credentials

Seed them first with `npm run seed`, then use:

| Account | Email | Password | Profile |
|---|---|---|---|
| Eleanor | `eleanor@demo.hydralert.app` | `Demo1234!` | 72yo, low activity, elderly |
| Marcus | `marcus@demo.hydralert.app` | `Demo1234!` | 28yo, high activity, athlete |
| Sarah | `sarah@demo.hydralert.app` | `Demo1234!` | 38yo, parent + caregiver for Emma |

---

## 🧪 Running Tests

### Backend (Jest + Supertest)

Requires a running MongoDB instance (test DB: `hydralert_test`).

```bash
cd backend && npm test
```

Tests cover: register, login, profile CRUD, log creation/retrieval, health check.

### Frontend (Vitest + React Testing Library)

```bash
cd frontend && npm test
```

Tests cover: RiskBadge rendering (all 3 risk levels), accessibility attributes, IntakeButtons interactions.

---

## 🚢 Deployment

### Option A: Docker Compose (recommended for demos)

```bash
cp .env.example .env  # fill in JWT_SECRET and OPENWEATHER_KEY
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- ML Service: http://localhost:5001

### Option B: Vercel (frontend) + Render (backend)

**Frontend → Vercel:**

1. Push `frontend/` to GitHub
2. Import in Vercel, set root directory to `frontend`
3. Set env var: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

**Backend → Render:**

1. Push `backend/` to GitHub
2. Create Render Web Service, set build command: `npm install`, start: `node src/index.js`
3. Set env vars: `MONGO_URI`, `JWT_SECRET`, `OPENWEATHER_KEY`, `ML_SERVICE_URL`
4. Deploy

**ML Service → Render (free tier):**

1. Push `ml-service/` to GitHub
2. Create Render Web Service (Python), build: `pip install -r requirements.txt`, start: `gunicorn app:app`
3. Copy the URL to `ML_SERVICE_URL` in backend env vars

**MongoDB → MongoDB Atlas (free tier):**

1. Create cluster at mongodb.com/atlas
2. Get connection string → `MONGO_URI`

---

## 🔒 Privacy & Data Handling

HydrAlert stores only the minimum data needed: your name, email, health profile (age, weight, activity level), and water intake logs. Passwords are hashed with bcrypt (12 rounds) and never stored in plaintext. No data is shared with or sold to third parties. All API communication uses JWT-authenticated endpoints. You can export all your data as JSON or permanently delete your account and all associated records from the Settings page at any time.

The app uses OpenWeatherMap to fetch weather data for your GPS coordinates — this request is proxied through our backend (not sent from the browser directly) and cached for 5 minutes.

---

## 👩‍⚖️ For Judges

### Non-technical summary

HydrAlert solves a real problem: most people don't know they're dehydrated until it's already affecting them. Our app takes the guesswork out by combining who you are (age, weight, activity level), what you've drunk recently, and what the weather is doing right now — then tells you clearly: your risk is **low / moderate / high**, and you need to drink **X ml now**.

Caregivers can link elderly parents or young children to their account and check on them with a single tap. A streak counter rewards consistent habits. Everything is mobile-first, accessible, and privacy-respecting.

### Technical summary

Clean, modular architecture: React + Tailwind frontend (Vite), Express + MongoDB backend with JWT auth, and a Flask microservice for scoring. The scoring formula is deterministic and well-commented — replacing it with a trained ML model requires changing exactly one function (`compute_score()` in `ml-service/app.py`). The backend falls back to a local copy of the formula if the ML service is unreachable, ensuring zero downtime for the core user experience.

---

## ⏱ 60-Second Demo Script

Use the Marcus (athlete) account for maximum visual impact.

1. **Open** http://localhost:5173 → landing page. Point out the hero, risk indicator preview, and demo accounts.

2. **Click "Sign in"** → fill in `marcus@demo.hydralert.app` / `Demo1234!` → Dashboard loads.

3. **Point to the Risk Badge** — score, color, and "Drink X ml now" message.

4. **Point to the Streak counter** — Marcus has a 12-day streak 🔥.

5. **Click "+250 ml"** button — toast appears, today's progress bar grows, score refreshes.

6. **Scroll down** — 7-day chart shows Marcus consistently near his 3,500 ml goal.

7. **Navigate to Profile** — show auto-calculate goal button.

8. **Navigate to Settings** → click "Download my data (JSON)" — instant GDPR-friendly export.

9. **(Bonus)** Log out → sign in as **Sarah** → go to Caregiver panel → add Emma's email → view Emma's dashboard and risk score.

**Total runtime: ~55 seconds.**

---

*HydrAlert is a demo application. It is not a medical device and should not be used for clinical decision-making.*
