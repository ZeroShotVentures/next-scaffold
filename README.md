# my-app

Next.js scaffold with authentication, Postgres, transactional email and optional Stripe subscriptions.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and Tailwind CSS 4
- [Better Auth](https://www.better-auth.com) for email/password and Google sign-in, with the Stripe plugin for subscriptions (off by default)
- [Resend](https://resend.com) for password reset and email verification emails
- [Prisma 7](https://www.prisma.io) on PostgreSQL (via `@prisma/adapter-pg`)
- [t3-env](https://env.t3.gg) + [Zod](https://zod.dev) for typed, validated environment variables
- [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting, [Biome](https://biomejs.dev) for formatting and import sorting
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) for unit tests
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit checks

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (version pinned in `package.json`)
- Docker (for the local database)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (only when billing is enabled)

## Getting started

```bash
pnpm install
pnpm db:up             # start Postgres in Docker
pnpm db:migrate        # apply migrations
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

`.env.example` is committed and loaded automatically as the lowest-priority defaults, so local development works without any setup. To override a value locally, put it in `.env` (gitignored). In production, set real values in the host environment. Priority, highest first: host environment, `.env.local`, `.env`, `.env.example`. (Prisma CLI only reads `.env` and `.env.example`.)

All variables are declared and validated in `src/env.ts`. The app refuses to build or start when one is missing or malformed, and prints which one. Import `env` from `@/env` instead of reading `process.env` directly.

> [!IMPORTANT]
> Never put secrets in `.env.example`. Outside production, `BETTER_AUTH_SECRET` falls back to a dev-only value; production builds and servers require a real one.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. The default matches `docker-compose.yml`. |
| `BETTER_AUTH_SECRET` | At least 32 characters, required in production. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Base URL of the app, e.g. `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client. Sign in with Google is enabled when both are set. |
| `RESEND_API_KEY` | Resend API key (`re_...`). Without it, emails are logged to the console in development and email features are disabled in production. |
| `EMAIL_FROM` | Sender for outgoing email, e.g. `my-app <hello@example.com>`. Must use a domain verified in Resend. |
| `BILLING_ENABLED` | `true` to enable Stripe subscriptions. Defaults to `false`. |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`). Required when billing is enabled. |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`). Required when billing is enabled. |
| `STRIPE_PRICE_*` | Stripe price IDs (`price_...`) per plan. Monthly prices are required when billing is enabled, annual prices are optional. |

## Sign in with Google

Off until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. To set it up:

1. In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), configure the OAuth consent screen, then create an OAuth client ID of type "Web application".
2. Add `http://localhost:3000/api/auth/callback/google` (and `https://<your-domain>/api/auth/callback/google` for production) as an authorized redirect URI.
3. Copy the client ID and secret into `.env`.

New Google users arrive with a verified email. If an email/password user with the same address already exists, Google sign-in links to that user only once they've verified their email; until then the Google sign-in is refused, which prevents account takeover through an unverified address.

## Email

Emails are sent through `sendEmail` in `src/lib/email.ts`. Better Auth uses it for:

- **Password reset**: "Forgot password?" on the sign-in form leads to `/forgot-password`. The emailed link ends at `/reset-password`. Resetting revokes all existing sessions.
- **Email verification**: sent on email/password sign-up. Verification is not required to sign in; the dashboard shows a banner with a resend button until the address is verified. To block unverified users, set `requireEmailVerification: true` in `src/lib/auth.ts`.

Without `RESEND_API_KEY`, emails (including their links) are printed to the server console in development, so you can click through the flows locally. In production, email features are disabled when no key is set: there's no "Forgot password?" link and no verification emails, so reset links never end up in logs.

To send real email, [verify a domain](https://resend.com/domains) in Resend, create an [API key](https://resend.com/api-keys) and set `RESEND_API_KEY` and `EMAIL_FROM`. Before a domain is verified, the default `onboarding@resend.dev` sender only delivers to your own Resend account address.

Like the billing flag, whether Google and email are enabled is read at build time, so changing them requires a rebuild/redeploy.

## Billing

Billing is off by default. With `BILLING_ENABLED=false`, the Stripe plugin is not loaded, no Stripe customers are created, the webhook endpoint does not exist and the dashboard hides the plans. The `Subscription` table and `user.stripeCustomerId` column stay in the schema, so enabling billing later needs no migration.

The flag is read at build time (the home page is prerendered), so changing it requires a rebuild/redeploy.

To enable billing locally:

1. Create products and prices in the [Stripe dashboard](https://dashboard.stripe.com/test/products) and fill in the `STRIPE_*` variables.
2. Set `BILLING_ENABLED=true`.
3. Forward webhooks to the local Better Auth endpoint and copy the printed `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
   ```

In production, add a webhook endpoint in the Stripe dashboard pointing at `https://<your-domain>/api/auth/stripe/webhook`.

Plans (display data and limits) are defined in `src/lib/plans.ts`. Their Stripe price IDs are mapped from env in `src/lib/auth.ts`.

### Enabling billing on an existing app

> [!WARNING]
> Turning billing on for an app that already has users is a product decision, not just a config change. Decide the following before flipping the flag.

**What works out of the box**

- No migration: the billing tables already exist.
- Existing users have no Stripe customer (customers are only created on sign-up while billing is on). The Stripe plugin creates one on the fly the first time a user subscribes, so no backfill is needed.

**What you need to decide: what do existing users get?**

Once any feature is gated by plan, every existing user suddenly has no subscription. If "no subscription" means "no access", you lock out your whole user base in one deploy. Options:

- **Free tier**: users without a subscription keep a limited free plan and can upgrade.
- **Grandfathering**: users created before a cutoff date keep full access (e.g. check `user.createdAt`).
- **Trial**: give existing users a trial period before gating kicks in.

Whichever you pick, route all feature checks through one function (e.g. "what is this user entitled to?") instead of checking subscriptions inline, so the policy lives in one place.

**Turning billing off again is the dangerous direction**

Stripe keeps charging active subscriptions after you disable billing, but the webhook endpoint no longer exists, so cancellations and failed payments stop syncing to the database. Cancel or migrate all active subscriptions in Stripe *before* setting `BILLING_ENABLED=false`.

**Checklist**

1. Create live products and prices in Stripe.
2. Add the production webhook endpoint in the Stripe dashboard.
3. Implement the access policy for existing users (see above).
4. Set `BILLING_ENABLED=true` and the `STRIPE_*` variables, then redeploy.
5. Tell existing users what changes for them.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | Run oxlint and check formatting with Biome |
| `pnpm fix` | Auto-fix lint issues and format |
| `pnpm typecheck` | Generate the Prisma client and run `tsc` |
| `pnpm test` / `pnpm test:watch` | Run unit tests once / in watch mode |
| `pnpm db:up` / `pnpm db:down` | Start / stop the Postgres container |
| `pnpm db:migrate` | Create and apply a migration from schema changes (dev) |
| `pnpm db:deploy` | Apply pending migrations (production) |
| `pnpm db:reset` | Drop the database and re-apply all migrations |
| `pnpm db:push` | Push the schema without a migration (prototyping only) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:generate` | Regenerate the Prisma client (also runs on install) |

The pre-commit hook runs oxlint and Biome on staged files.

## Project structure

```
prisma/
  schema.prisma        database schema
  migrations/          SQL migrations
src/
  app/                 routes (App Router)
  components/          React components (+ colocated tests)
  lib/                 auth, email, feature flags, Prisma client, plans
  env.ts               environment schema
  generated/prisma/    generated Prisma client (gitignored)
```
