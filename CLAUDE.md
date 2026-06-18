# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Serve the production build
npm run lint         # ESLint (eslint-config-next, flat config in eslint.config.mjs)

npm run seed                       # Seed Firestore from data/*.ts (projects, experiences, skills, sections)
npm run seed:admin <email>         # Grant the `admin` custom claim to a user (email must also be in ADMIN_EMAILS)
```

There is no test runner configured.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · TailwindCSS 4 · Firebase (Firestore + Auth) · Cloudinary · GSAP · Slate.js. Path alias `@/*` maps to the repo root.

## Architecture

This is a **CMS-powered portfolio**: all displayed content lives in Firestore and is editable inline on the live site by an authenticated admin. Two distinct features share the app — the portfolio (landing page) and a client-side notes app (`/notes`).

### Content / CMS flow

- Page sections are fetched **server-side** at render via `lib/firebase/server/services` (firebase-admin) and passed into `PageProvider` (`lib/context/PageContent.tsx`) as `initialSections`.
- `NestedSections` is shaped `{ [collection]: { [sectionKey]: Section } }`. A `Section` always carries its own `id` and `collection` so it knows where to persist.
- Inline edits call `editField(collection, sectionKey, fieldKey, value)`. `fieldKey` supports dot-paths (e.g. `position.title`) for nested updates. Edits mark the section dirty (`dirtySections` set, keyed `collection:sectionKey`).
- Image edits register a `PendingImage`; the actual Cloudinary upload is deferred until save (`saveSection` / `saveAll`), then the resulting URL is written into the section.
- Saves `PATCH` to `/api/admin/firebase/{collection}/{id}`. There is no realtime listener — local state is the source of truth after load, re-synced on save.

### Two Firebase layers — keep them separate

- **Client** (`lib/firebase/config.ts`, `lib/firebase/services/`): browser SDK, used for auth and any client reads. Orders collections by `createdAt desc` by default.
- **Server** (`lib/firebase/server/admin.ts`, `lib/firebase/server/services/`): firebase-admin SDK, used in Server Components and API routes for privileged reads/writes. `createDocument`/`updateDocument`/`upsertDocument` auto-stamp `createdAt`/`updatedAt`.

### Auth & admin gate (defense in depth)

- Client (`lib/context/auth.tsx`): on sign-in, checks the `admin` custom claim; if absent, signs the user out. On success it writes the ID token to the `adminToken` cookie and exposes `isAdmin` / `isEditing` / `toggleEdit`.
- Server (`lib/firebase/server/services/auth.ts`): every admin API route calls `requireAdmin()`, which verifies the `adminToken` cookie AND requires the email be present in `ADMIN_EMAILS`. Both the custom claim and the env allowlist must agree.
- Admin write routes live under `app/api/admin/firebase/[collection]/[id]/`. On auth failure they return `{ logout: true }` with 401 so the client can force sign-out.

### Firestore serialization

Firestore Timestamps cross the server→client boundary as `{ _seconds, _nanoseconds }`. Always run server-fetched data and incoming request bodies through `serializeFirestoreData` (`lib/serialize.ts`), which converts those to ISO strings before JSON.

### Routing (App Router route groups)

- `app/(landing-page)/` — portfolio. Uses a parallel `@modal` slot with intercepting route `(.)project/[id]` so project clicks open as a modal over the page; direct navigation to `project/[id]` renders the full page. `revalidate = 60`.
- `app/(misc)/notes/` — standalone notes app. Notes are stored in **IndexedDB** (`lib/notes-db.ts`, db `scribble-notes`), edited with Slate, and shared via `/api/notes/share` (server-persisted share links).
- `app/(admin)/admin/login/` — admin login.

### Components

- `components/customs/sections/` — the portfolio sections (Banner, About, Projects, Experience, Skills, Contact) rendered by the landing page; these consume `usePageContext`.
- `components/customs/cards/`, `components/customs/notes/` — feature components.
- `components/ui/` — shadcn-style primitives (see `components.json`).

## Conventions

- Custom markdown extensions are supported in content (handled by the renderer): `^^primary color^^`, `__underline__`, `~~br~~`, plus standard `**bold**` / `*italic*` / `~~strike~~` / links.
- Data seeded from `data/*.ts` matches the types in `types.ts` (`Project`, `Skill`, `Experience`).
- Site-wide constants/links: `lib/constants.ts` and `utils/config/site.ts`.

## Environment

Copy `.env.example` → `.env.local`. Required groups: Firebase client (`NEXT_PUBLIC_FIREBASE_*`), Firebase admin (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_DB_URL`, `FIREBASE_PROJECT_ID`), `ADMIN_EMAILS` (comma-separated allowlist), and Cloudinary (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). For `FIREBASE_PRIVATE_KEY`, keep it quoted with literal `\n` newlines. Remote image hosts are allowlisted in `next.config.ts`.
