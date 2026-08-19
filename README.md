# Codexa

Real-time collaborative code review platform with AI-powered code quality reports.

Codexa lets developers submit code snippets, receive peer reviews, discuss snippets live, and get an AI-generated quality report (readability, maintainability, performance, and an overall score) via Google's Gemini API.

**Stack:** React 19 + Vite + Tailwind (frontend) · Node.js + Express 5 + MongoDB + Socket.IO (backend) · Gemini API (AI reports) · Vercel + MongoDB Atlas (deployment)

---

## Implemented Features

**Authentication & Accounts**
- JWT-based auth with bcrypt password hashing and role-based access control (`user` / `admin`)
- Forgot/reset password via email, with hashed, time-limited (15-min) reset tokens
- Rate limiting on auth routes to slow down credential stuffing

**Code Snippets**
- Full CRUD on snippets (title, code, language), owner/admin-restricted edit & delete
- Paginated, aggregation-optimized snippet listing with review count, AI status, and score
- Syntax-highlighted code view with one-click copy

**Peer Reviews**
- Star ratings (1–5) and written comments per snippet
- Helpful / unhelpful voting with correct vote-switching logic

**AI Code Quality Reports**
- On-demand analysis via Gemini (`gemini-flash-latest`, auto-updating alias)
- Scores for readability, maintainability, performance, and overall, plus actionable suggestions
- Server-side validation of AI output; invalid/malformed responses are never persisted

**Real-Time Collaboration**
- Authenticated Socket.IO connections, per-snippet rooms
- Live presence, typing indicators, and live comment stream
- In-app notifications for new reviews, comments, and AI reports

**Admin Analytics**
- Dashboard with platform totals, weekly signups, top contributors, and AI score trends (cached, aggregation-based)

**UI/UX**
- Dashboard, profile, and snippet pages with light/dark theme support
- Toast notifications and confirmation modals for destructive actions

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- A MongoDB database (local or Atlas)
- A Google Gemini API key
- (Optional) A Gmail App Password, for password-reset emails

### Backend
```bash
cd backend
npm install
```
Create `backend/.env`:
```
PORT=5000
MONGO_URI=<mongodb connection string>
JWT_SECRET=<random secret>
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<gemini api key>
EMAIL_USER=<gmail address>
EMAIL_PASS=<gmail app password>
EMAIL_FROM=<optional, defaults to EMAIL_USER>
```
```bash
npm run dev     # development
npm start       # production
```
API runs at `http://localhost:5000/api`.

### Frontend
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
```bash
npm run dev
```
App runs at `http://localhost:5173`.

### Deployment
Both apps are configured for Vercel (`vercel.json` in each folder; the backend runs as a serverless function via `backend/api/index.js`). Production uses MongoDB Atlas. All environment variables above must be set in the Vercel project settings for both deployments.

---

## Week 5–8 Progress

| Week | Focus | Summary |
|------|-------|---------|
| **5** | AI Integration | Replaced mock AI scoring with a real Gemini integration; switched to an auto-updating model alias to avoid breakage from model deprecation. |
| **6** | Real-Time & Notifications | Built the notification system (model, controller, routes, UI) and a full Socket.IO layer: authenticated connections, per-snippet rooms, presence, typing indicators, and live comments. |
| **7** | Admin Analytics & Polish | Added the admin analytics dashboard (aggregation-based) and a toast/confirmation-modal system for destructive actions. |
| **8** | Deployment | Migrated to MongoDB Atlas, implemented forgot/reset password, and completed Vercel deployment configuration for both frontend and backend. |

---

## Challenges Faced

- **Authentication & authorization** were the most demanding areas — JWT verification had to stay consistent across Express middleware, admin-only routes, and Socket.IO handshakes, and the password-reset flow required careful token hashing and generic responses to avoid account enumeration.
- **MongoDB Atlas & deployment** required several iterations to get right: wrapping Express as a Vercel serverless function, keeping the DB connection stable in a serverless context, and correcting CORS/SPA routing for production.
- Replacing mock AI scoring with a genuine Gemini integration took multiple passes to make the prompt, schema, and response validation reliable.
- Socket.IO doesn't track room membership by default, so presence, typing, and live comments required a substantial custom implementation.
- An initial N+1 query pattern in snippet listing was resolved with a single aggregation pipeline.

## Known Limitations
- Password-reset/notification emails rely on Gmail SMTP, suitable for this scale but not a transactional email provider.
- No automated test suite; correctness has relied on manual verification.
- Notifications are delivered via polling rather than pushed over the existing Socket.IO connection.
- Code sent for AI analysis is truncated at 12,000 characters.
