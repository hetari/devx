# شريكك

An AI-powered Nuxt app for managing business finances, transactions, insights, goals, and assistant-driven workflows.

<img width="2818" height="1616" alt="image" src="https://github.com/user-attachments/assets/7e587cfb-65fb-4070-9ca3-0b6506486f3e" />

## Presentation url
https://hetari.github.io/devx/

## What this project does

- Tracks cash flow, revenue, expenses, and transactions.
- Surfaces AI-generated insights and operational suggestions.
- Includes dashboard, chat, reports, goals, learning, and settings pages.
- Uses Prisma with SQLite for local data storage.

## Requirements

- Node.js 20+ or Bun
- A Gemini API key

## Install

Install dependencies with Bun:

```bash
bun install
```

If you prefer npm, pnpm, or yarn, install with your package manager instead:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Environment Setup

Create your environment file:

```bash
cp .env.example .env
```

Then set the required variables in `.env`:

- `GEMINI_API_KEY`: your Google Gemini API key

## Database Setup

This app uses Prisma with SQLite. Run the full database setup with:

```bash
bun run db:setup
```

That command runs:

1. `prisma generate`
2. `prisma migrate dev`
3. `prisma db seed`

If you want to run those steps separately, use:

```bash
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
```

## Run the App

Start the development server:

```bash
bun run dev
```

Then open:

```text
http://localhost:3000
```

## Production

Build the app for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

## Available Scripts

These are the scripts defined in `package.json`:

- `bun run dev` - start the Nuxt dev server
- `bun run build` - build the app for production
- `bun run generate` - generate a static build
- `bun run preview` - preview the production build locally
- `bun run lint` - run ESLint
- `bun run lint:fix` - run ESLint and fix what it can
- `bun run prisma:generate` - generate Prisma client code
- `bun run prisma:migrate` - create and apply Prisma migrations
- `bun run prisma:seed` - seed the database
- `bun run db:setup` - generate Prisma, migrate, and seed in one step

## Notes

- The app is a Nuxt 4 project.
- `postinstall` runs `nuxt prepare`, so dependency installation also prepares Nuxt types and auto-imports.
- If you change Prisma schema or database structure, rerun the Prisma setup scripts above.
