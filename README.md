# my-app

Next.js scaffold with authentication, Stripe subscriptions and Postgres.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and Tailwind CSS 4
- [Better Auth](https://www.better-auth.com) for email/password auth, with the Stripe plugin for subscriptions
- [Prisma 7](https://www.prisma.io) on PostgreSQL (via `@prisma/adapter-pg`)
- [t3-env](https://env.t3.gg) + [Zod](https://zod.dev) for typed, validated environment variables
- [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting, [Biome](https://biomejs.dev) for formatting and import sorting
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) for unit tests
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit checks

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (version pinned in `package.json`)
- Docker (for the local database)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhooks)

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm db:up             # start Postgres in Docker
pnpm db:migrate        # apply migrations
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

All variables are declared and validated in `src/env.ts`. The app refuses to build or start when one is missing or malformed, and prints which one. Import `env` from `@/env` instead of reading `process.env` directly.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. The default matches `docker-compose.yml`. |
| `BETTER_AUTH_SECRET` | At least 32 characters. Generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Base URL of the app, e.g. `http://localhost:3000`. |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`). |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`), see below. |
| `STRIPE_PRICE_*` | Stripe price IDs (`price_...`) per plan. Annual prices are optional. |

### Stripe webhooks

Forward Stripe events to the local Better Auth webhook endpoint:

```bash
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

Copy the printed `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`.

Plans (display data and limits) are defined in `src/lib/plans.ts`. Their Stripe price IDs are mapped from env in `src/lib/auth.ts`.

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
  lib/                 auth, Prisma client, plans
  env.ts               environment schema
  generated/prisma/    generated Prisma client (gitignored)
```
