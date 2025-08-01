# AgilePM

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database & Prisma](#database--prisma)
- [Linting & Formatting](#linting--formatting)
- [Styling](#styling)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

---

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 with your browser to see the result.

## Project Structure

.
├── [.env.example](http://_vscodecontentref_/0) # Example environment variables
├── [docker-compose.yml](http://_vscodecontentref_/1) # Docker Compose configuration
├── Dockerfile # Dockerfile for containerization
├── prisma/ # Prisma schema and migrations
│ ├── schema.prisma
│ └── migrations/
├── public/ # Static assets
├── src/ # Application source code
├── .next/ # Next.js build output (auto-generated)
├── [package.json](http://_vscodecontentref_/2)
├── [README.md](http://_vscodecontentref_/3)
└── ...

## Environment Variables

Copy .env.example to .env.local and fill in the required values.
.env.local is ignored by git and should be used for secrets and environment-specific settings.

## Database & Prisma

This project uses Prisma as the ORM.

The schema is defined in prisma/schema.prisma.
To run migrations:
npx prisma migrate dev

To generate Prisma client:
npx prisma generate

## Linting & Formatting

ESLint is configured via eslint.config.mjs.
Run linting with:
npm run lint

## Styling

Tailwind CSS is used for styling.
Configuration files:
tailwind.config.js,
postcss.config.js.

## Learn More

To learn more about Next.js, take a look at the following resources:
Next.js Documentation – learn about Next.js features and API.
Learn Next.js – an interactive Next.js tutorial.
Next.js GitHub repository

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.
Check out the Next.js deployment documentation for more details. ``````
