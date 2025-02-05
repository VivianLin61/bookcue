<a href="https://bookcue.vercel.app">
  <h1 align="center">Bookshelf: Organize and track your favorite books</h1>
</a>

 <img width="1440" alt="dashboard_mockup" src="https://github.com/VivianLin61/bookcue/blob/main/apps/web/public/landing/dashboard.png?raw=true">

<p align="center">
  Organize and track your favorite books with Bookshelf, a modern bookshelf app that helps you keep track of your reading list.
</p>

<p align="center">
  <a href="#directory-structure"><strong>Directory Structure</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
</p>
<br/>

## Directory Structure

Bookshelf is a monorepo managed by [Nx](https://nx.dev/). The monorepo is split between `web` and `api` directories.
```sh
    .
    ├── apps
    │   ├── web                     # Front-end application
    │   │   ├── src
    │   │   │   ├── app             # App router and layout
    │   │   │   ├── config          # Global configurations
    │   │   │   ├── providers       # Global providers
    │   │   │   ├── components      # Shared components used across the entire application
    │   │   │   ├── modules         # Feature-based modules
    │   │   │   ├── hooks           # Shared hooks used across the entire application
    │   │   │   ├── lib             # Reusable libraries preconfigured for the application
    │   │   │   ├── stores          # Global state stores
    │   │   │   ├── types           # Shared types used across the application
    │   │   │   └── graphql         # GraphQL queries and mutations
    │   │   ├── public              # Static assets to be served
    │   │   └── ...
    │   ├── api                     # Backend application
    │   │   ├── config              # Global configurations
    │   │   ├── libs                # Different feature modules of the application.
    │   │   ├── prisma              # Prisma schema and migrations
    │   │   ├── src                 # Source code directory
    │   │   │   ├── config          # Configuration files
    │   │   │   ├── schema.gql      # GraphQL schema definitions
    │   │   │   ├── app.module.ts   # Main application module for NestJS
    │   │   │   ├── main.ts         # Entry point for the application
    │   │   ├── docs                # Documentation files
    │   │   ├── email               # Email templates and configuration
    │   │   ├── ...
    ├── LICENSE
    └── README.md
```

## Installation

Clone & create this repo locally with the following command:

```bash
git clone https://github.com/VivianLin61/bookcue.git
```

1. Install dependencies using pnpm:

```bash
pnpm install
```

2. Copy and update environment variables the `web` application:
```bash
cp apps/web/.env.example apps/web/.env
```

3. Copy and update environment variables the `api` application:
```bash
cp apps/api/.env.example apps/api/.env
```

4. Sync Prisma schema  with your database schema
```bash
pnpm db:migrate:dev
```

5. Start the development servers
```bash
pnpm serve:all

# or start the backend and frontend separately
pnpm serve:api
pnpm serve:web
```

## Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) – React framework for building high quality web applications with the power of React components
- [Auth.js](https://authjs.dev/) – Auth.js is a simple, secure, and scalable way to add authentication to your app.
- [shadcn/ui](https://ui.shadcn.com/) – Beautifully designed reusable components that you can copy and paste into your apps.
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [motion](https://motion.dev/) – A modern animation library for JavaScript and React
- [Lucide](https://lucide.dev/) – Beautiful & consistent icons
- [Zustand](https://zustand.surge.sh/) – A small, fast and scalable bearbones state-management solution.

### Platforms
- [Resend](https://resend.com/) – Resend is the email API for developers.
- [React Email](https://react.email/) – A collection of high-quality, unstyled components for creating beautiful emails using React and TypeScript.

### Backend
- [Nest.js](https://nestjs.com/) – A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- [GraphQL](https://graphql.org/) – GraphQL is a query language for APIs that lets clients control the data they receive, making your apps fast and stable.
- [Apollo Client](https://www.apollographql.com/docs/react/) - Apollo Client is a comprehensive JavaScript state management library that handles both local and remote data using GraphQL.
- [Prisma](https://www.prisma.io/) – Typescript-first ORM for Node.js
