# `src/shared/pipes/`

## Purpose

Provides **pure transformation and validation pipeline functions** that can be composed to process incoming data before it reaches domain logic. Pipes are stateless, free of side effects, and can be used in both server and client code.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `Pipe<I, O>` | `type` | A pure transformation function from `I` to `O` |
| `schemaPipe(schema)` | `Pipe<unknown, Result<T, ValidationError>>` | Parse raw input through a Zod schema; returns a `Result` |
| `transformPipe(fn)` | `Pipe<I, O>` | Wrap an arbitrary mapping function as a `Pipe` |
| `composePipes(first, second)` | `Pipe<A, C>` | Compose two pipes left-to-right (`A → B → C`) |
| `trimPipe(obj)` | `T extends Record<string, unknown>` | Strip leading/trailing whitespace from all string fields |

## Usage

```typescript
import { schemaPipe, trimPipe, composePipes } from "@/shared";
import { z } from "zod";

const CreateWorkspaceSchema = z.object({ name: z.string().min(1) });

// Validate + trim in one composed pipeline
const parse = composePipes(
  transformPipe((raw: unknown) => (typeof raw === "object" && raw ? trimPipe(raw as Record<string, unknown>) : raw)),
  schemaPipe(CreateWorkspaceSchema),
);

const result = parse(req.body);
if (!result.ok) throw result.error; // ValidationError
const { name } = result.value;
```

## Conventions

- All pipes must be **pure** (no mutation, no I/O).
- Use `schemaPipe` at Server Action / Route Handler boundaries to validate untrusted input.
- Use `composePipes` to build reusable processing chains rather than nesting inline functions.
- Do not add async pipes here; async transformations belong in Application-layer use cases.
