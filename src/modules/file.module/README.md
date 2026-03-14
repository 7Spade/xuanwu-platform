# file.module

**Bounded Context:** File · Document Intelligence  
**Layer:** Workspace

## Purpose

`file.module` handles file storage, versioning, and the document intelligence pipeline:
parsing, object extraction, and AI-powered content analysis.

## What this module owns

| Concern | Description |
|---------|-------------|
| File | Upload, storage, versioning, access control |
| FileVersion | Immutable version records per file |
| DocParse | Structured document parsing (PDF, DOCX, Markdown) |
| ObjExtract | Entity / table / diagram extraction from documents |
| Intelligence | AI pipeline outputs (summaries, embeddings, Q&A) |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `workspace.module` | → | Files are scoped to a workspace |
| `account.module` | → | File owners are Accounts |
| `collaboration.module` | ← | Inline comments anchor to file lines/blocks |
| `search.module` | ← | File content is indexed for full-text search |

## Standard 4-layer structure

```
file.module/
├── index.ts
├── domain.file/
│   ├── _entity.ts               # File + FileVersion + IntelligenceResult
│   ├── _value-objects.ts
│   ├── _ports.ts                # IFileStoragePort, IDocParsePort, IObjExtractPort
│   └── _events.ts               # FileUploaded, DocParsed, ObjExtracted
├── core/
│   ├── _use-cases.ts
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```
