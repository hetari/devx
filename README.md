# Build your company with AI

<img width="2818" height="1616" alt="image" src="https://github.com/user-attachments/assets/7e587cfb-65fb-4070-9ca3-0b6506486f3e" />

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
bun install
```

## Environment Variables

Copy the `.env.example` file to `.env` and provide your Gemini API Key:

```bash
cp .env.example .env
```

Required variables:
- `GEMINI_API_KEY`: Your Google Gemini API key.

## Database Setup

This project uses Prisma with SQLite. Initialize the database, run migrations, and seed initial data:

```bash
bun run db:setup
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
