# Deprecated Frontend Files

This directory contains files that have been replaced during the Monorepo migration.

## Files

### `api.ts.old`
- **Original location**: `src/services/api.ts`
- **Replaced by**: 
  - `src/services/apiDefinitions.ts` (shared API definitions)
  - `web/src/services/api.ts` (Web-specific API exports)
  - `web/src/services/httpClient.ts` (Web HTTP client)
- **Reason**: Refactored to use dependency injection pattern for platform-agnostic API layer

## Migration Date
2026-02-04

## Notes
These files are kept for reference during the migration. They can be safely deleted once migration is complete and tested.
