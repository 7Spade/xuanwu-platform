---
name: next-best-practices
description: 'Next.js App Router best practices for file conventions, RSC/Client boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, and bundling. Automatically loaded when working on Next.js code. Triggers: "nextjs", "app router", "server component", "route handler", "next/image", "metadata".'
user-invocable: false
---

# Next Best Practices

## Consolidation Status
- Canonical Next.js skill family entrypoint.
- Consolidated and removed wrappers: `next-cache-components`, `next-upgrade`.

## Reference Files

This skill provides authoritative guidance for the following areas. Load the relevant reference when working on that topic:

| Topic | Reference |
|-------|-----------|
| File conventions (`layout`, `page`, `loading`, `error`, `route`) | [nextjs.org/docs/app/getting-started/layouts-and-pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) |
| RSC and Client Component boundaries | [nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components) |
| Directives (`"use client"`, `"use server"`, `"use cache"`) | [nextjs.org/docs/app/api-reference/directives](https://nextjs.org/docs/app/api-reference/directives) |
| Data fetching patterns | [nextjs.org/docs/app/getting-started/fetching-data](https://nextjs.org/docs/app/getting-started/fetching-data) |
| Async APIs (params, searchParams, cookies, headers) | [nextjs.org/docs/app/api-reference/functions/cookies](https://nextjs.org/docs/app/api-reference/functions/cookies) |
| Metadata and `<head>` management | [nextjs.org/docs/app/getting-started/metadata-and-og-images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) |
| Error handling (`error.tsx`, `global-error.tsx`) | [nextjs.org/docs/app/getting-started/error-handling](https://nextjs.org/docs/app/getting-started/error-handling) |
| Route handlers | [nextjs.org/docs/app/getting-started/route-handlers](https://nextjs.org/docs/app/getting-started/route-handlers) |
| Image optimization (`next/image`) | [nextjs.org/docs/app/api-reference/components/image](https://nextjs.org/docs/app/api-reference/components/image) |
| Font optimization (`next/font`) | [nextjs.org/docs/app/api-reference/components/font](https://nextjs.org/docs/app/api-reference/components/font) |
| Suspense boundaries | [nextjs.org/docs/app/getting-started/linking-and-navigating#streaming](https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming) |
| Hydration errors | [nextjs.org/docs/messages/react-hydration-error](https://nextjs.org/docs/messages/react-hydration-error) |
| Bundling and tree-shaking | [nextjs.org/docs/app/getting-started/optimizing](https://nextjs.org/docs/app/getting-started/optimizing) |
| Runtime selection (Node.js vs Edge) | [nextjs.org/docs/app/api-reference/edge](https://nextjs.org/docs/app/api-reference/edge) |
| Script loading (`next/script`) | [nextjs.org/docs/app/api-reference/components/script](https://nextjs.org/docs/app/api-reference/components/script) |
| Self-hosting | [nextjs.org/docs/app/getting-started/deploying](https://nextjs.org/docs/app/getting-started/deploying) |
| Parallel routes and slots | [nextjs.org/docs/app/api-reference/file-conventions/parallel-routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) |
| Built-in functions | [nextjs.org/docs/app/api-reference/functions](https://nextjs.org/docs/app/api-reference/functions) |
| Debug tips | [nextjs.org/docs/app/getting-started/debugging](https://nextjs.org/docs/app/getting-started/debugging) |

## Core Rules

- Default to Server Components; add `"use client"` only for browser APIs, event handlers, or stateful interactivity.
- Treat `params`, `searchParams`, `cookies()`, and `headers()` as async — always `await` them.
- Place Route Handlers under `app/api/**/route.ts`; never call them from Server Components.
- Use `next/image` for all `<img>` tags and `next/font` for typefaces.
- Use route-level `loading.tsx` and `error.tsx` for streaming and error boundaries.
- Consult the relevant reference file above before implementing any Next.js feature.

## Guardrails
- Do not use `next/dynamic(..., { ssr: false })` inside Server Components.
- Do not hardcode cache options (`cache: 'force-cache'`) when `"use cache"` is available.
- Flag version-sensitive behavior and check the current Next.js docs before implementing.

## Source of Truth
- Next.js App Router docs: https://nextjs.org/docs/app
- VS Code Copilot Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
