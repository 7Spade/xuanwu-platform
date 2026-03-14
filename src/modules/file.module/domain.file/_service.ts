// File domain services.
// DocumentIntelligenceService — orchestrates DocParse → ObjectExtract → Intelligence pipeline.
//   Emits DocumentParsed event; consumed by workspace.module for WBS task auto-generation.
// FileVersionConflictService — detects concurrent upload conflicts using version numbers
//   and determines which version becomes the canonical current version.
