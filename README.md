## Suitable Calendar — README

A small Next.js (App Router) scheduling app using Clerk for auth, Drizzle (Neon) for data, and Google Calendar integration.

This README gives clear steps to run locally, build for production, and troubleshoot common issues encountered during development.

---

### Quick Start (local)

1. Install dependencies

```powershell
npm install
```

2. Create `.env.local` (copy from `.env.example` if provided) and set environment variables (see section below).

3. Run database migrations (if you use the included scripts):

```powershell
npm run db:migrate
```

4. Run the development server

```powershell
npm run dev
```

5. Build for production

```powershell
npm run build
```

6. Start the production server locally (after build)

```powershell
npm run start
```

---

### Required environment variables

Create `.env.local` and set these values before running the app:

- `DATABASE_URL` — Postgres/Neon connection string used by Drizzle.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (client-side).
- `CLERK_SECRET_KEY` (or `CLERK_API_KEY`) — Clerk server key used by `@clerk/nextjs/server` (server-side).
- `GOOGLE_OAUTH_CLIENT_ID` — Google OAuth client ID.
- `GOOGLE_OAUTH_CLIENT_SECRET` — Google OAuth client secret.
- `GOOGLE_OAUTH_REDIRECT_URL` — Redirect URI configured in Google OAuth and Clerk.
- `NODE_ENV` — `development` or `production` (optional; used by build/runtime).

Note: Exact Clerk env var names can vary by version; match whatever your Clerk dashboard or package docs expect.

---

### Common CLI commands

- `npm run dev` — Start development server with HMR
- `npm run build` — Create production build (`.next` artifacts)
- `npm run start` — Start the production server (after `build`)
- `npm run db:migrate` — Run database migrations (project-specific)

---

### Google Calendar & OAuth notes

- The app stores users' OAuth access tokens in Clerk. When calling the Google Calendar API we fetch the user's token from Clerk and use it via the `googleapis` client.
- Common error: `Request had insufficient authentication scopes.` — this means the stored token did not include Calendar scopes. Fix:
  - In Clerk (or the OAuth flow) request the proper scopes. For read+write events you need `https://www.googleapis.com/auth/calendar.events` (or `https://www.googleapis.com/auth/calendar`).
  - Re-authorize the user (tokens issued before adding scopes will not gain new scopes automatically).

Error visible in UI: `Failed to fetch calendar events: Request had insufficient authentication scopes.` — re-run the OAuth flow and inspect token scopes in Clerk.

---

### Clerk tips / gotchas encountered in this repo

- `clerkClient` export shape may vary between package versions. Some versions export an async initializer (a function you call) while others export a ready-made client object. The codebase includes a small helper that resolves either form; if you see `TypeError: Cannot read properties of undefined (reading 'getUser')` or TypeScript errors about `clerkClient` shapes, ensure your installed `@clerk/nextjs` version matches usage or use the provided `resolveClerkClient()` helper pattern.
- Avoid calling server-only Clerk helpers (from `@clerk/nextjs/server`) inside client components — keep server/client separation strict.

---

### Debugging tips (quick)

- Build-time TypeScript errors: read the `next build` output; the message usually indicates the file and line. Fix type mismatches or narrow generic types (we used a cast for `zodResolver` in `EventForm.tsx`).
- Runtime server errors in dev: check `.next/dev/logs/next-development.log` — it contains server and browser logs when running `next dev`.
- OAuth issues: check Clerk admin for the user's OAuth access tokens and `scopes` metadata; also ensure your Google Cloud OAuth client has Calendar API enabled.
- Drizzle/SQL issues: run the failing SQL against your DB console to inspect errors (missing relation, wrong schema). Ensure migrations have been applied.

---

### Deploy

Recommended: Vercel for Next.js app router apps. Push to your repo and configure the environment variables in the provider's dashboard.

For self-hosting:

1. Build: `npm run build`
2. Start: `npm run start`
3. Ensure `DATABASE_URL`, Clerk keys, and Google OAuth env vars are set in your environment.

---

If you'd like, I can:

- Add a `README` section with detailed Clerk/Google console steps (with screenshots links).
- Create a small debug route to inspect `clerkClient` shape at runtime (dev only).

### How the app works (high level)

- Authentication: users sign in with Clerk. The app uses `@clerk/nextjs` server helpers in server components and actions to access user data and stored OAuth tokens.
- Scheduling model: each user has a `Schedule` (saved in Postgres via Drizzle) with multiple `ScheduleAvailability` rows describing weekly availability windows.
- Booking flow:
  - Public visitor opens `GET /book/[clerkUserId]` and sees a `PublicProfile` with the user's public events.
  - Selecting an event shows available time slots computed by the server action `getValidTimesFromSchedule` (considers schedule availabilities and Google Calendar events).
  - When a visitor books, the server action `createMeeting` validates the selected slot and calls `createCalendarEvent` to insert the event into the user's Google Calendar using the user's OAuth token stored in Clerk.
- Google integration: OAuth tokens for Google are stored via Clerk's OAuth access tokens API. The server fetches the token with `clerkClient.users.getUserOauthAccessToken(...)` and constructs a `google.auth.OAuth2` client to call Calendar APIs.

### Main file structure

Top-level (important files/folders):

```
.
├─ app/                       # Next.js App Router
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ (main)/                 # App groups (layouts, protected routes)
│  │  ├─ (public)/book/        # Public booking pages
│  │  │  ├─ [clerkUserId]/page.tsx
│  │  │  └─ [clerkUserId]/[eventId]/page.tsx
│  │  └─ ...
│  └─ pages/                   # misc app pages (booking UI components)
├─ components/                # Reusable React components (forms, cards, UI)
│  ├─ forms/                   # form components (EventForm, MeetingForm)
│  └─ PublicProfile.tsx
├─ server/                    # Server-only helpers & actions
│  ├─ actions/                 # Server actions (events, meetings, schedule)
│  └─ google/                  # Google Calendar integration (googleCalendar.ts)
├─ drizzle/                   # Drizzle DB config & schema
│  ├─ db.ts
│  └─ schema.ts
├─ public/                    # Static assets
├─ README.md
├─ package.json
└─ next.config.ts
```

Key files to inspect when debugging:

- `server/google/googleCalendar.ts` — Google OAuth client creation and Calendar API calls.
- `server/actions/schedule.ts` — schedule queries and `getValidTimesFromSchedule` logic.
- `components/forms/MeetingForm.tsx` — client-side booking form that calls server actions.
- `app/(main)/(public)/book/[clerkUserId]/page.tsx` — public profile loader that fetches Clerk user metadata.

---

If you'd like, I can expand the tree (include more files) or add a diagram for the booking flow.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
