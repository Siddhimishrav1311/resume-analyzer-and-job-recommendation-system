# Copilot Instructions

## Project Overview

This is a Next.js 16 App Router application for resume analysis and job recommendations. It uses React 19, TypeScript, Prisma, PostgreSQL, Tailwind CSS, and ESLint.

## Repository Structure

- `app/`: App Router pages and API route handlers.
- `components/`: UI organized by feature (`dashboard`, `jobs`, `layout`, `resume`, `ui`) and shared presentation concerns.
- `hooks/`: Client-side data and workflow hooks.
- `lib/`: Shared server/domain logic such as parsing, scoring, matching, recommendations, Prisma access, and utilities.
- `ai/`: NLP, ML, and prompt-related processing.
- `constants/`, `data/`, `types/`, `validation/`: Domain constants, seed/static data, TypeScript types, and input validation.
- `prisma/`: Prisma schema, migrations, and seed code.
- `docs/`: Project documentation.
- `public/`: Static images, icons, and logos.
- `uploads/`: Local uploaded resume files during development.

## Development Commands

- `npm run dev`: Start the development server.
- `npm run lint`: Run ESLint.
- `npm run build`: Build the Next.js application.
- `npm run start`: Start the production build.

Run `npm run lint` after focused code changes and `npm run build` for changes affecting routes, data loading, configuration, or shared types.

## Coding Conventions

- Use strict TypeScript and preserve the `@/*` path alias for workspace-root imports.
- Follow existing Next.js server/client component boundaries. Add `"use client"` only to components that require browser state, effects, or event handlers.
- Keep API handlers under `app/api/**/route.ts`; validate request input with the existing validation modules and return `NextResponse` responses consistent with neighboring routes.
- Keep domain logic in `lib/` or `ai/` rather than embedding it in pages and route handlers.
- Reuse existing components, hooks, constants, types, and utilities before adding new abstractions.
- Keep feature-specific components in their corresponding `components/<feature>/` directory.
- Use the existing Tailwind/CSS patterns and Geist fonts; avoid broad visual or dependency changes for focused behavior fixes.
- Preserve public APIs and existing data shapes unless the task explicitly requires a contract change.
- Do not commit generated output, `.next/`, local uploads, secrets, or environment files.

## Data and Uploads

Resume uploads are written to the local `uploads/` directory in development and processed through the NLP/scoring pipeline before persistence. Treat uploaded files and extracted text as untrusted input: validate file metadata and input sizes, avoid exposing local filesystem paths, and keep secrets in environment variables.

## Change Discipline

Make the smallest focused change that solves the request. Do not revert unrelated worktree changes. Update tests or documentation when a behavior or public workflow changes, and report any validation command that could not be run.
