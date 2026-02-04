# Migration Guide: Updating Import Paths

When migrating code from `frontend/src/` to `frontend/web/src/`, follow these import path rules:

## Import Path Rules

### Use `@/` for Shared Code
Import from these directories using `@/`:
- `@/types` - Type definitions
- `@/theme/colors` - Color palette
- `@/theme/tokens` - Design tokens
- `@/constants` - Business constants
- `@/utils` - Utility functions
- `@/services/apiDefinitions` - API definitions
- `@/hooks` - Business logic hooks
- `@/providers/types` - Provider interfaces

### Use `@web/` for Web-Specific Code
Import from these directories using `@web/`:
- `@web/services/api` - Web API exports (with HTTP client)
- `@web/services/httpClient` - Axios HTTP client
- `@web/providers` - Web providers (MUI-based)
- `@web/pages` - Web pages
- `@web/components` - Web components
- `@web/theme` - MUI theme files

## Examples

### Before (incorrect):
```typescript
import type { WorkoutResponse } from '@/types';
import { workoutApi } from '@/services/api';  // ❌ Wrong
import HomePage from '@/pages/HomePage';      // ❌ Wrong
```

### After (correct):
```typescript
import type { WorkoutResponse } from '@/types';  // ✅ Shared
import { workoutApi } from '@web/services/api';  // ✅ Web-specific
import HomePage from '@web/pages/HomePage';      // ✅ Web-specific
```

## Find and Replace Patterns

When updating a file:

1. **Web-specific imports** - Replace `@/` with `@web/` for:
   - `@/services/api` → `@web/services/api`
   - `@/pages/` → `@web/pages/`
   - `@/components/` → `@web/components/`
   - `@/providers/` → `@web/providers/` (except types.ts)
   - `@/theme/` → `@web/theme/` (except colors.ts and tokens.ts)

2. **Keep `@/`** for:
   - `@/types`
   - `@/theme/colors`
   - `@/theme/tokens`
   - `@/constants`
   - `@/utils`
   - `@/hooks`
   - `@/providers/types`

## Common Mistakes

❌ `import { brand } from '@web/theme/colors'` - Should be `@/theme/colors`
❌ `import type { Response } from '@web/types'` - Should be `@/types`
✅ `import { workoutApi } from '@web/services/api'` - Correct
✅ `import { formatDateTime } from '@/utils/formatters'` - Correct
