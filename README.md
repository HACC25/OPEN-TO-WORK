## OPEN-TO-WORK

Enterprise Technology Services (ETS) standardized IT project review web app that centralizes Independent Verification and Validation (IV&V) vendor reports into actionable dashboards for state stakeholders. Built with the Next.js App Router, Convex realtime back-end, and Clerk-authenticated multi-tenant admin/vendor workflows.

## Purpose
- **Why Convex**: Convex was selected for its unified data platform—database, file storage, and background jobs reside within one managed runtime—significantly increasing engineering velocity. Its first-class realtime synchronization primitives keep dashboards, comment feeds, and performance metrics consistent across concurrent sessions without additional infrastructure.
- **Why Clerk**: Clerk furnishes hosted user management, session orchestration, and Convex-compatible JWT templating, allowing the team to deliver secure authentication flows without diverting effort into password recovery, session expiration policies, or bespoke token generation.
- **Why Next.js**: Next.js App Router and file-based routing provide predictable patterns for per-tenant layouts, nested route groups, and streaming dashboards. This reduces boilerplate, accelerates UI iteration, and maintains alignment with contemporary React practices.

---

## Tech Stack
- Next.js 16 (App Router) + React 19
- Convex for realtime data, storage, and background jobs
- Clerk JWT templates for authentication inside Convex
- Tailwind CSS 4 + shadcn/ui component primitives

---

## Prerequisites
1. **Node.js 20+** (align with Next 16 & React 19 requirements)
2. **npm** (or pnpm/bun, but scripts below use npm)
3. **Convex CLI**: `npm install -g convex`
4. **Clerk account** with a JWT template named `convex`

---

## Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=

# Convex
CONVEX_DEPLOYMENT=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=

# OpenAI
OPENAI_API_KEY=
```

Mirror `CLERK_JWT_ISSUER_DOMAIN` in the Convex dashboard so Convex auth matches Clerk, and include `CONVEX_DEPLOYMENT` / `CONVEX_DEPLOY_KEY` in the Vercel deployment environment.

---

## Local Development
```bash
cd app
npm install

# start Convex (needs convex dev running to serve mutations/queries)
npx convex dev

# start the Next.js app
npm run dev
```
Visit http://localhost:3000. Both the Next.js dev server and the Convex dev process must stay running.

---

## Deployment

### 1. Convex backend
Create a project in the Convex dashboard first. That dashboard is where you can obtain `NEXT_PUBLIC_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_SITE_URL` and generate the `CONVEX_DEPLOY_KEY` pair used later by Vercel. See the official guide for Vercel deployments with Convex for more detail: https://docs.convex.dev/production/hosting/vercel.

### 2. Next.js Deployment
1. Import the repository into Vercel and select the `app` directory as the project root if prompted.
2. Under **Settings → Environment Variables**, add every variable from the list above for both Production and Preview scopes, ensuring `CONVEX_DEPLOYMENT` and `CONVEX_DEPLOY_KEY` are present so the Vercel build can talk to Convex.
3. Under **Settings → Build & Output**, keep the framework preset as Next.js, set the output directory to `.vercel/output`, and disable any default install command overrides (Vercel will run `npm install` automatically).
4. Still in **Build & Output**, set the build command to `convex codegen && npx convex deploy --cmd 'npm run build'` so Convex codegen/deploy happen before the Next.js production build kicks off.

### 3. Clerk configuration
- Ensure the same Clerk instance is referenced by both Vercel (frontend) and Convex (backend).
- In Clerk, create a JWT template named `convex` with the Convex deployment’s domain as the audience.
- Copy the issuer URL into `CLERK_JWT_ISSUER_DOMAIN` and the Convex dashboard variable. Follow the Convex + Clerk integration guide for the full flow: https://docs.convex.dev/auth/clerk.
- To sync Clerk events (user updates, deletions, etc.) back into Convex, configure Clerk webhooks that call your Convex functions: https://clerk.com/blog/webhooks-data-sync-convex.

Once all three are configured, the deployed Next.js app can call Convex mutations/queries securely via the Convex React client.

---

## File Structure (abridged)
```
OPEN-TO-WORK/
├─ README.md               # This guide
├─ LICENSE
└─ app/
   ├─ app/                 # App Router routes
   │  ├─ dashboard/        # Admin & vendor dashboards
   │  └─ public/           # Public-facing landing/report pages
   ├─ components/
   │  ├─ dashboard/        # Feature-rich UI blocks for admin/vendor flows
   │  ├─ landing/          # Marketing/landing page sections
   │  └─ ui/               # shadcn-based primitives (accordion, dialog, etc.)
   ├─ convex/              # Convex schema + functions (reports, comments, files…)
   ├─ providers/           # Context providers (e.g., `convex-client-provider.tsx`)
   ├─ hooks/               # Custom hooks (e.g., mobile viewport detection)
   ├─ public/              # Static assets (branding, screenshots)
   ├─ next.config.ts       # Next.js configuration
   ├─ tsconfig.json        # TypeScript project config
   └─ package.json         # Scripts & dependencies
```

---

## npm Scripts
- `npm run dev` – Next.js dev server (requires `npx convex dev`)
- `npm run build` – Production build
- `npm run start` – Run the compiled build locally

---

## Troubleshooting
- **Convex client error about missing URL**: ensure `NEXT_PUBLIC_CONVEX_URL` is set before starting the dev server or build.
- **Auth issues inside Convex mutations**: verify `CLERK_JWT_ISSUER_DOMAIN` matches the Clerk JWT template issuer and that Convex dashboard env variables mirror `.env.local`.
- **Tailwind styles missing in prod**: upgrade Tailwind CLI and ensure PostCSS config matches Tailwind v4 requirements (already scaffolded via `postcss.config.mjs`).

