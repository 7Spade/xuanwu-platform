---
name: shadcn
description: >
  Project-aware shadcn/ui skill for Xuanwu. Knows the project's component aliases,
  registry configuration, installed components, Tailwind setup, and correct import paths.
  Use when adding, customizing, or troubleshooting shadcn/ui components in this project.
  Triggers: "shadcn", "ui component", "add component", "button", "dialog", "dropdown",
  "form", "table", "card", "shadcn/ui", "radix", "component registry".
user-invocable: false
---

# shadcn/ui Project Skill for Xuanwu

Project-aware guidance for shadcn/ui in the Xuanwu platform.
Source: [ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills)

## Project Configuration (`components.json`)

| Setting | Value |
|---------|-------|
| Style | `new-york` |
| RSC | `true` |
| TypeScript | `true` |
| Tailwind CSS | `src/app/globals.css` |
| Base color | `neutral` |
| CSS variables | `true` |
| Icon library | `lucide-react` |

## Alias Map

All component imports use project-specific path aliases — **never** use relative paths from `components/ui`:

| Alias | Resolves to |
|-------|-------------|
| `@/design-system/primitives` | All shadcn/ui components |
| `@/design-system/primitives/ui` | Raw UI primitives (Button, Input, Dialog…) |
| `@/design-system/primitives/lib/utils` | `cn()` utility |
| `@/design-system/primitives/hooks` | shadcn/ui hooks |

```tsx
// ✅ Correct import
import { Button } from "@/design-system/primitives/ui/button";
import { cn } from "@/design-system/primitives/lib/utils";

// ❌ Wrong — do not use default shadcn paths
import { Button } from "@/components/ui/button";
```

## Adding Components

Use the shadcn CLI with the project's component alias:

```bash
npx shadcn add <component>
```

The CLI reads `components.json` and places files in `src/design-system/primitives/ui/`.

To browse available components:
```bash
npx shadcn search <keyword>
```

Or use the shadcn MCP server (already configured in `.vscode/mcp.json`):
- `shadcn-list_items_in_registries` — list all components
- `shadcn-search_items_in_registries` — fuzzy search
- `shadcn-view_items_in_registries` — inspect component source
- `shadcn-get_item_examples_from_registries` — find usage examples
- `shadcn-get_add_command_for_items` — get the correct CLI install command

## Composition Rules

- Use `DropdownMenu` for action menus with 3+ options.
- Use `Dialog` + `DialogContent` for modal workflows.
- Use `Sheet` for side panels and mobile drawers.
- Use `Form` + `FormField` + `FormMessage` (react-hook-form integration) for all user input.
- Use `Table` + `DataTable` pattern for tabular data.
- Use semantic `variant` prop rather than boolean flags (`variant="destructive"`, `variant="outline"`).
- Use `cn()` from `@/design-system/primitives/lib/utils` to merge Tailwind classes.

## Dark Mode

Dark mode is enabled via `next-themes` `ThemeProvider` in `src/app/layout.tsx`.
All CSS variables in `src/app/globals.css` have `.dark` overrides.
Use `bg-background`, `text-foreground`, `border-border` etc. — these auto-adapt.

## Theming

The project uses **CSS variables** (not Tailwind color utilities directly) for theming:
- `--background`, `--foreground` — page background/text
- `--primary`, `--primary-foreground` — primary interactive color
- `--secondary`, `--secondary-foreground` — secondary elements
- `--muted`, `--muted-foreground` — muted/placeholder text
- `--destructive`, `--destructive-foreground` — error/danger states
- `--border`, `--ring` — borders and focus rings

Override in `src/app/globals.css` under `:root` and `.dark`.

## Key Components in This Project

| Component | Location | Notes |
|-----------|----------|-------|
| `Button` | `@/design-system/primitives/ui/button` | Variants: default, destructive, outline, secondary, ghost, link |
| `DropdownMenu` | `@/design-system/primitives/ui/dropdown-menu` | Used in `ModeToggle`, `MarketingHeader` locale selector |
| `Dialog` | `@/design-system/primitives/ui/dialog` | Used in workspace dialogs |
| `Form` | `@/design-system/primitives/ui/form` | react-hook-form integration |
| `Card` | `@/design-system/primitives/ui/card` | Used in dashboard cards |
| `Sidebar` | `@/design-system/primitives/ui/sidebar` | App shell sidebar |
| `Avatar` | `@/design-system/primitives/ui/avatar` | User avatars in nav |

## MCP Server

The shadcn MCP server is pre-configured in `.vscode/mcp.json`.
Use `shadcn-search_items_in_registries` and `shadcn-view_items_in_registries` before
implementing any new shadcn/ui component to verify its API and usage patterns.

## Related

- [vercel-react-best-practices](./../vercel-react-best-practices/SKILL.md) — React performance
- [vercel-composition-patterns](./../vercel-composition-patterns/SKILL.md) — Composition APIs
- [next-best-practices](./../next-best-practices/SKILL.md) — Server/client boundaries
- Project `components.json`: `/components.json`
- shadcn/ui docs: https://ui.shadcn.com
- shadcn MCP: https://ui.shadcn.com/docs/mcp
