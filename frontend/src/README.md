# Frontend Shared Code

This directory contains **platform-agnostic code** that can be reused by both the Web version (`web/`) and Miniprogram version (`miniprogram/`).

## Directory Structure

```
src/
├── constants/       # Shared constants (categories, enums, etc.)
├── hooks/           # Shared business logic hooks
├── providers/       # Provider interface definitions
├── services/        # API definitions (platform-agnostic)
├── theme/           # Design tokens and color palette
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (formatters, validators)
```

## Usage

Both `web/` and `miniprogram/` can import from `src/` using the `@/` path alias:

```typescript
// Example
import { brand, gray } from '@/theme/colors';
import type { WorkoutResponse } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { useWorkoutList } from '@/hooks/useWorkoutList';
```

## Reusability Guidelines

### ✅ Should be in `src/` (100% reusable)
- Type definitions
- Constants and enums
- Color palettes and design tokens
- Utility functions (formatters, validators)
- Business logic hooks
- API definitions (using dependency injection)

### ⚠️ Should be in platform folders (platform-specific)
- UI components
- Pages/screens
- Platform-specific implementations (HTTP clients, Providers)
- Routing configuration
- Build configurations

## Key Patterns

### Dependency Injection for APIs

API definitions are in `src/services/apiDefinitions.ts`, but the HTTP client is injected:

```typescript
// Shared definition
export const createWorkoutApi = (client: ApiClient) => ({ ... })

// Web implementation
import { webHttpClient } from './httpClient';
export const workoutApi = createWorkoutApi(webHttpClient);

// Miniprogram implementation
import { miniprogramHttpClient } from './httpClient';
export const workoutApi = createWorkoutApi(miniprogramHttpClient);
```

### Hooks with Callbacks

Shared hooks accept platform-specific callbacks:

```typescript
const { workouts, loading } = useWorkoutList({
  workoutApi,
  onError: (msg) => showNotification(msg), // Platform-specific
  onSuccess: (msg) => showNotification(msg),
});
```
