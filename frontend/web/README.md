# Web Platform

This directory contains the **Web-specific** implementation of the fitness tracking app using React + Vite + Material-UI.

## Getting Started

```bash
cd frontend/web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Directory Structure

```
web/
├── src/
│   ├── services/        # Web HTTP client implementation
│   │   ├── httpClient.ts    # Axios-based HTTP client
│   │   └── api.ts           # API exports with injected client
│   ├── providers/       # Web providers (MUI-based)
│   ├── pages/           # Web pages (Material-UI components)
│   ├── components/      # Web components (Material-UI)
│   ├── theme/           # MUI theme configuration
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts       # Vite configuration with path aliases
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Importing Shared Code

Use the `@/` alias to import from the shared `src/` directory:

```typescript
// Shared types
import type { WorkoutResponse } from '@/types';

// Shared constants
import { CATEGORIES } from '@/constants/categories';

// Shared utilities
import { formatDateTime } from '@/utils/formatters';

// Shared hooks
import { useWorkoutList } from '@/hooks/useWorkoutList';

// Shared theme
import { brand, gray } from '@/theme/colors';
import { spacing, typography } from '@/theme/tokens';

// Web-specific API (with injected HTTP client)
import { workoutApi } from '@web/services/api';
```

## Using Shared Hooks

Example: Using `useWorkoutList` hook in a Web component:

```typescript
import { useWorkoutList } from '@/hooks/useWorkoutList';
import { workoutApi } from '@web/services/api';
import useNotifications from '@web/providers/useNotifications';

const WorkoutList = () => {
  const notifications = useNotifications();
  
  const { workouts, loading, deleteWorkout } = useWorkoutList({
    workoutApi,
    onError: (msg) => notifications.show(msg, { severity: 'error' }),
    onSuccess: (msg) => notifications.show(msg, { severity: 'success' }),
  });

  // Render with Material-UI components
  return (
    <DataGrid rows={workouts} loading={loading} ... />
  );
};
```

## Material-UI Theme

The Web platform uses Material-UI with custom theme based on shared color palette:

```typescript
// web/src/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { brand, gray } from '@/theme/colors';

export const theme = createTheme({
  palette: {
    primary: {
      main: brand[400],
      light: brand[200],
      dark: brand[700],
    },
  },
});
```

## Migration Notes

When migrating existing code from `frontend/src` to `web/src`:

1. Update imports:
   - `@/types` remains the same (still in shared)
   - `@/services/api` → `@web/services/api`
   - `@/providers/useNotifications` → `@web/providers/useNotifications`

2. Extract business logic to shared hooks in `src/hooks/`

3. Keep UI-specific code (Material-UI components) in `web/src/`
