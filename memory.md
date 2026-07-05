# Memory — Fantasy League Frontend (Next.js)

Last updated: 2026-07-05T16:33:00+01:00

## What was built

- Scaffolded Next.js 16 (App Router, TypeScript, no Tailwind) at `/Users/shredder/Projects/fantasy-league-client/`
- Installed `better-auth` for client-side auth (mirrors the NestJS backend)
- **Design system** (`src/app/globals.css`): CSS custom properties — dark navy base, electric blue accent, Space Grotesk + Inter fonts, animation keyframes, utility classes
- **Auth client** (`src/lib/auth-client.ts`): `createAuthClient` pointing at `http://localhost:3000`
- **API lib** (`src/lib/api.ts`): Typed fetch wrapper covering all backend endpoints with `credentials: 'include'`
- **Types** (`src/lib/types.ts`): TypeScript types for all entities (User, Group, GroupMember, Event, Rule, Prediction, Leaderboard, Score)
- **Auth context** (`src/context/auth-context.tsx`): `AuthProvider` + `useAuth` hook with `signIn`, `signUp`, `signOut`
- **UI primitives**: `Button`, `Input`, `Badge`, `Modal`, `Tabs`/`TabPanel`, `Spinner`/`FullPageSpinner` — all with CSS Modules
- **Navbar** (`src/components/layout/Navbar.tsx`): glassmorphism sticky navbar with auth-aware user menu
- **Root layout** (`src/app/layout.tsx`): wraps everything in `AuthProvider` + `Navbar`
- **Root page** (`src/app/page.tsx`): redirect to `/dashboard` if auth'd, `/login` if not
- **Login page** (`src/app/login/page.tsx`): email + password form
- **Register page** (`src/app/register/page.tsx`): name + email + password form
- **Dashboard** (`src/app/dashboard/page.tsx`): group cards grid with Create/Join modals
- **Group components**: `GroupCard`, `GroupCard.module.css`, `GroupModals.tsx` (Create + Join)
- **Group detail** (`src/app/groups/[id]/page.tsx`): Events / Members / Leaderboard tabs with admin member-role toggle
- **Event components**: `EventCard`, `EventCard.module.css`, `EventModals.tsx` (CreateEvent)
- **Leaderboard**: `LeaderboardTable` with medal icons for top-3, ARIA table roles
- **Event detail** (`src/app/groups/[id]/events/[eventId]/page.tsx`): rules list, Yes/No prediction form, prediction view (post-submission), AddRule modal for admins

## Decisions made

- **Location**: Sibling directory `/Users/shredder/Projects/fantasy-league-client/` — clean separation from backend
- **Framework**: Next.js 16.2 (Turbopack dev server)
- **Styling**: Vanilla CSS Modules — no Tailwind; design tokens via CSS custom properties
- **Auth**: Better Auth client SDK via `createAuthClient` — session cookies, `credentials: 'include'` on all fetches
- **API base URL**: `process.env.NEXT_PUBLIC_API_URL` → set to `http://localhost:3000` in `.env.local`
- **Port**: Frontend runs on **3001** (`npm run dev -- -p 3001`); backend already trusted `localhost:3001` via `BETTER_AUTH_TRUSTED_ORIGINS`
- **State**: React Context (`AuthProvider`) only; no Redux/Zustand needed for MVP
- **No SSR**: All pages use `'use client'` — avoids token forwarding complexity
- **Backend untouched**: Zero changes to the NestJS server

## Problems solved

- `create-next-app` rejected capital letters in directory names — used `fantasy-league-client` as the package/dir name
- `better-auth` client uses `authClient.getSession()` / `authClient.signIn.email()` / `authClient.signUp.email()` — not generic HTTP calls

## Current state

- Frontend compiles with **zero errors or warnings**
- Dev server runs at `http://localhost:3001` (`npm run dev -- -p 3001`)
- Login page confirmed visually in browser — dark navy design, electric blue CTA, no console errors
- Auth context, API lib, and all pages are wired together
- Backend CORS/trusted origins already configured for `localhost:3001`

## Next session starts with

- Test the full auth flow (register → dashboard → create group → join group) against the running backend
- Consider adding: toast notifications for errors/success, loading skeletons for card grids, event status update controls for admins
- Consider adding: `next.config.ts` API proxy rewrite (`/api/*` → `localhost:3000/*`) to avoid CORS issues in production builds

## Open questions

- The backend crashes on Kafka connection failure — run `docker-compose up -d` (from the server dir) to start Kafka, or set `KAFKA_ENABLED=false` in the backend `.env` while testing the frontend
- Need to verify `GET /users/me/groups` returns nested `group` + `group.members` — if not, Dashboard may need to call `GET /groups` instead and cross-reference membership
