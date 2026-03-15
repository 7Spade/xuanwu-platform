---
name: vercel-composition-patterns
description: >
  React composition patterns that scale — avoiding boolean prop proliferation, compound
  components, render props, and slot-based composition. Use when designing reusable
  component APIs, reviewing component interfaces, or refactoring components that have
  grown too many boolean flags or conditional branches.
  Triggers: "composition patterns", "compound component", "boolean prop proliferation",
  "render prop", "slot pattern", "component API design".
user-invocable: false
---

# Vercel Composition Patterns

React composition patterns for building scalable, maintainable component APIs.
Source: [vercel.com/docs/agent-resources/skills](https://vercel.com/docs/agent-resources/skills)

## When to use this skill

- Designing a reusable component that is getting too many boolean props
- Reviewing a component API for maintainability
- Refactoring tightly coupled parent/child rendering logic
- Building design-system components that need to be composable

---

## 1. Avoid Boolean Prop Proliferation

When a component accumulates many boolean flags (`isLoading`, `isError`, `isDisabled`, `isPrimary`, `isLarge`…), it is a sign that composition should replace configuration.

```tsx
// ❌ Boolean prop explosion
<Button isPrimary isLarge isLoading isDisabled>Save</Button>

// ✅ Composition via variant + slot
<Button variant="primary" size="lg" asChild>
  <Link href="/save">Save</Link>
</Button>
```

**Rule of thumb:** If you need more than 2–3 boolean props to describe visual or behavioral variants, reach for composition or a `variant` prop with a discriminated union type.

---

## 2. Compound Components

Expose a family of components that share implicit state through context, giving callers flexible control over structure.

```tsx
// Context
const AccordionContext = createContext<AccordionContextValue | null>(null);

// Root
function Accordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ open, setOpen }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}

// Sub-components
Accordion.Item = function AccordionItem({ id, children }: AccordionItemProps) { /* ... */ };
Accordion.Trigger = function AccordionTrigger({ id, children }: AccordionTriggerProps) { /* ... */ };
Accordion.Content = function AccordionContent({ id, children }: AccordionContentProps) { /* ... */ };

// Usage — caller controls structure
<Accordion>
  <Accordion.Item id="q1">
    <Accordion.Trigger id="q1">What is Xuanwu?</Accordion.Trigger>
    <Accordion.Content id="q1">A platform for...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

> **Note:** shadcn/ui components (e.g. `Accordion`, `Dialog`, `DropdownMenu`) already use this pattern — follow their lead.

---

## 3. Slot-Based Composition (Children as Flexible Slots)

Accept `ReactNode` props for named regions instead of hardcoding structure. Used in `RootShell` and layout components in this project.

```tsx
// ✅ Slot-based layout shell
interface PageLayoutProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function PageLayout({ header, footer, children }: PageLayoutProps) {
  return (
    <>
      {header && <header className="sticky top-0 z-50">{header}</header>}
      <main className="flex-1">{children}</main>
      {footer && <footer>{footer}</footer>}
    </>
  );
}
```

---

## 4. `asChild` / Polymorphic Components

Allow a component to render as a different HTML element or React component without duplicating its logic. Radix UI's `asChild` prop is the standard approach.

```tsx
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function Button({ asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} />;
}

// Renders as an anchor, but with Button styles
<Button asChild>
  <a href="/dashboard">Go to Dashboard</a>
</Button>
```

---

## 5. Render Props (Inversion of Control)

When a parent needs to delegate rendering to the caller, use render props or children-as-function.

```tsx
// ✅ Render prop for flexible list items
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
}

function List<T>({ items, renderItem, emptyState }: ListProps<T>) {
  if (items.length === 0) return <>{emptyState ?? <p>No items.</p>}</>;
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item, i)}</li>)}</ul>;
}

// Caller owns the rendering
<List
  items={workspaces}
  renderItem={(ws) => <WorkspaceCard workspace={ws} />}
  emptyState={<EmptyWorkspaces />}
/>
```

---

## 6. Controlled vs. Uncontrolled Components

Design reusable components to support both modes:
- **Uncontrolled** — manages state internally; good for simple cases.
- **Controlled** — caller owns state via `value` + `onChange`; required for forms and complex UIs.

```tsx
interface ToggleProps {
  defaultChecked?: boolean; // uncontrolled
  checked?: boolean;        // controlled
  onChange?: (checked: boolean) => void;
}
```

---

## Related

- [vercel-react-best-practices](./../vercel-react-best-practices/SKILL.md) — Performance and memoization
- [next-best-practices](./../next-best-practices/SKILL.md) — Server vs. client boundaries
- [ddd-architecture](./../ddd-architecture/SKILL.md) — Application layer composition patterns
- Radix UI primitives: https://www.radix-ui.com/primitives
