# goal. — Track Your Progress, Achieve Your Dreams

A full-stack goal tracking web app built with React 19, TypeScript, Tailwind CSS v4, Neon (Postgres), and Vercel. Users can discover goals through an AI-powered onboarding quiz, track progress, earn achievements, and create custom goals.

---

## Features

- **AI-powered onboarding** — pick categories and get personalized goal suggestions from Gemini 2.5
- **Goal tracking** — mark goals complete, set due dates, add notes, and track progress
- **Achievements** — earn badges automatically as you hit milestones
- **Custom goals** — create your own goals with a 3-step guided flow
- **Authentication** — roll-your-own auth with bcryptjs + JWT + httpOnly cookies
- **Responsive design** — mobile-first with a desktop sidebar layout
- **Pending goals sync** — unauthenticated users can explore goals and save them when they register

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 6, Tailwind CSS v4 |
| State      | React Context (auth), useState/useEffect      |
| Backend    | Vercel Serverless Functions (Node.js)         |
| Database   | Neon (Postgres) via Drizzle ORM               |
| Auth       | bcryptjs + jsonwebtoken + httpOnly cookies    |
| AI         | Google Gemini 2.5 Flash                       |
| Icons      | Lucide React                                  |
| Deployment | Vercel                                        |

---

## Project Structure

```
goal-tracker/
  api/                      ← Vercel serverless functions
    auth/
      index.ts              ← GET (session), POST (login, register, logout)
    user-goals/
      index.ts              ← GET, POST user goals
      [id].ts               ← PATCH, DELETE single goal
    categories.ts           ← GET categories
    suggest-goals.ts        ← POST Gemini goal suggestions
    custom-goals.ts         ← POST custom goal creation
    achievements.ts         ← GET, POST achievements
  src/
    components/
      Layout.tsx            ← Sidebar + bottom nav wrapper
      ProtectedRoute.tsx    ← Auth guard for protected pages
    context/
      AuthContext.tsx       ← Auth state and functions
    pages/
      Home.tsx              ← Dashboard
      Onboarding.tsx        ← Category picker
      GoalSuggestions.tsx   ← AI goal suggestions
      GoalDetail.tsx        ← Single goal view
      CustomGoal.tsx        ← 3-step custom goal creation
      Achievements.tsx      ← Achievements gallery
      Profile.tsx           ← User profile and stats
      Login.tsx             ← Sign in
      Register.tsx          ← Create account
    lib/
      schema.ts             ← Drizzle schema
      seed.ts               ← DB seed script
    types/
      goal.ts               ← Shared Goal interface
```

---

## Database Schema

```
users           → id, email, password_hash, display_name, onboarding_complete
categories      → id, name, icon
goals           → id, title, description, category_id, is_custom
user_goals      → id, user_id, goal_id, due_date, completed_at, status
achievements    → id, name, description, icon, trigger_rule
user_achievements → id, user_id, achievement_id, earned_at
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account
- A [Vercel](https://vercel.com) account
- A [Google AI Studio](https://aistudio.google.com) API key

### Installation

```bash
git clone https://github.com/terrence-celestine/goal-tracker
cd goal-tracker
npm install
```

### Environment Variables

Create a `.env` file at the root:

```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Generate a secure JWT secret:

```bash
openssl rand -hex 64
```

### Database Setup

Push the schema to Neon:

```bash
npm run db:push
```

Seed categories and achievements:

```bash
npx tsx src/lib/seed.ts
```

### Development

```bash
npx vercel dev
```

This runs both the Vite frontend and Vercel serverless functions locally.

### Deployment

```bash
git push origin main
```

Vercel auto-deploys on push. Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Achievement Trigger Rules

Achievements are evaluated server-side using a `trigger_rule` field in the format `rule:threshold`:

| Rule                | Description               |
| ------------------- | ------------------------- |
| `goals_completed:N` | Complete N goals          |
| `goals_added:N`     | Add N goals to your list  |
| `custom_goal:N`     | Create N custom goals     |
| `due_date_set:N`    | Set a due date on N goals |

To add new achievements, insert a row into the `achievements` table with a valid `trigger_rule` — no code changes needed.

---

## Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run db:push      # Push Drizzle schema to Neon
npx drizzle-kit studio  # Open Drizzle Studio GUI
npx tsx src/lib/seed.ts # Seed the database
```

---

## Live Demo

[goal-tracker.vercel.app](https://goal-tracker.vercel.app)

---

## Author

Terrence Celestine — [github.com/terrence-celestine](https://github.com/terrence-celestine)
