# Xuanwu Platform — Development Commands

## Development
```bash
npm run dev          # Start Next.js dev server (port 9002 via next-devtools)
npm run build        # Production build
npm run start        # Start production server
```

## Quality Gates
```bash
npm run lint         # ESLint (next/core-web-vitals + TypeScript)
npm run type-check   # tsc --noEmit
```

## Testing
No test runner configured yet (no jest/vitest/playwright test scripts). Check package.json for updates.

## When task is complete
1. Run `npm run lint` — fix all lint errors
2. Run `npm run type-check` — fix all type errors
3. Commit with conventional commit message (feat/fix/docs/chore/refactor)
4. Use `report_progress` tool to push to PR

## File conventions
- TypeScript files: UTF-8 without BOM
- Identifiers: English (camelCase/PascalCase/UPPER_SNAKE_CASE per context)
- UI text: NEVER hardcode — add keys to `src/shared/i18n/index.ts` (en + zh-TW)
- Module exports: ONLY via `index.ts` barrel per module
