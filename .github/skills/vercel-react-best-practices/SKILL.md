---
name: vercel-react-best-practices
description: >
  React and Next.js performance optimization guidelines. Use when reviewing or implementing
  React components, optimizing rendering performance, auditing bundle size, or following
  Vercel-recommended patterns for production Next.js applications.
  Triggers: "React performance", "memo", "bundle size", "rendering optimization",
  "avoid re-render", "lazy load", "code splitting".
user-invocable: false
---

# Vercel React Best Practices

React and Next.js performance optimization guidelines from Vercel's production experience.
Source: [vercel.com/docs/agent-resources/skills](https://vercel.com/docs/agent-resources/skills)

## When to use this skill

- Reviewing React component performance
- Optimizing bundle size and code splitting
- Preventing unnecessary re-renders
- Auditing server vs. client component decisions in Next.js

---

## 1. Server Components First (Next.js App Router)

- **Default to Server Components.** Add `"use client"` only when you need browser APIs, event handlers, or stateful interactivity.
- Every `"use client"` boundary creates a new client bundle entry — keep boundaries as far down the tree as possible.
- Compose: wrap a small interactive island in `"use client"` while keeping the surrounding layout server-rendered.

```tsx
// ✅ Server Component (no directive needed)
export async function ProductList() {
  const products = await fetchProducts();
  return <ul>{products.map(p => <ProductItem key={p.id} product={p} />)}</ul>;
}

// ✅ Isolated client leaf
"use client";
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ...
}
```

---

## 2. Memoization

Use `React.memo`, `useMemo`, and `useCallback` **only when**:
- The component re-renders due to parent updates that don't affect its props.
- A computed value is expensive (> 1ms).
- A callback is passed as a prop to a memoized child.

**Anti-patterns to avoid:**
```tsx
// ❌ Premature memoization — trivial computation
const label = useMemo(() => `Hello ${name}`, [name]);

// ✅ Justified — passed to memo'd child
const handleSubmit = useCallback(() => onSubmit(formData), [formData, onSubmit]);
```

---

## 3. Code Splitting and Lazy Loading

- Use `next/dynamic` for components that are not critical to the initial viewport.
- Never use `next/dynamic({ ssr: false })` inside Server Components.
- Use `React.lazy` + `Suspense` in client-only subtrees.

```tsx
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});
```

---

## 4. Image and Font Optimization

- **Always** use `next/image` for `<img>` tags — auto-sizes, lazy-loads, and serves WebP/AVIF.
- **Always** use `next/font` — eliminates layout shift from external font loading.
- Set `priority` only on the LCP image (above-the-fold hero).

```tsx
import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] }); // no external request at runtime
```

---

## 5. Key Prop Discipline

- Use **stable, unique identifiers** as `key` (database IDs, slugs).
- Never use array index as `key` for lists that can be reordered or filtered.
- A wrong `key` forces full unmount/remount — use only to intentionally reset state.

---

## 6. useEffect Best Practices

- Declare all reactive values used inside `useEffect` in the dependency array.
- Prefer Server Components or `fetch` with `cache` over `useEffect` for data fetching.
- Cleanup subscriptions and timers to prevent memory leaks.

```tsx
useEffect(() => {
  const subscription = subscribe(id, handler);
  return () => subscription.unsubscribe(); // cleanup
}, [id]); // id is the reactive value
```

---

## 7. Bundle Analysis

Run `ANALYZE=true next build` (with `@next/bundle-analyzer`) to inspect bundle composition.
- Identify large client-side chunks that could be moved to Server Components.
- Audit third-party imports — prefer tree-shakeable ESM packages.
- Lazy-load heavy libraries (e.g. chart libraries, PDF renderers, editors).

---

## 8. Streaming and Suspense

- Wrap slow data-fetching Server Components in `<Suspense fallback={<Skeleton />}>`.
- Use `loading.tsx` for route-level streaming — shows immediately while the page shell loads.
- Avoid sequential data fetching — use `Promise.all` / `Promise.allSettled` for parallel requests.

```tsx
// ✅ Parallel data fetching in Server Component
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

---

## Related

- [next-best-practices](./../next-best-practices/SKILL.md) — File conventions, RSC boundaries, async APIs
- [vercel-composition-patterns](./../vercel-composition-patterns/SKILL.md) — Component composition patterns
- Next.js App Router docs: https://nextjs.org/docs/app
