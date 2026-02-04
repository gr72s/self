# Miniprogram Platform (WeChat)

This directory contains the **WeChat Miniprogram** implementation using Taro framework with React syntax.

## Getting Started

### Install Dependencies
```bash
cd frontend/miniprogram
npm install
```

### Development

#### Build for WeChat Miniprogram
```bash
npm run dev:weapp
```

This will watch for changes and rebuild automatically. Import the `dist` folder in WeChat Developer Tools.

#### Build for H5 (Testing)
```bash
npm run dev:h5
```

## Directory Structure

```
miniprogram/
├── src/
│   ├── services/
│   │   ├── httpClient.ts    # Taro.request implementation
│   │   └── api.ts           # API exports with injected client
│   ├── pages/               # Miniprogram pages
│   │   └── index/           # Example home page
│   ├── components/          # Taro components
│   ├── app.tsx              # Main app component
│   ├── app.config.ts        # App configuration
│   └── app.scss             # Global styles
├── config/
│   └── index.ts             # Taro build configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Importing Shared Code

Use the `@/` alias to import from the shared `src/` directory:

```typescript
// Shared types
import type { WorkoutResponse } from '@/types';

// Shared utilities
import { formatDateTime } from '@/utils/formatters';

// Shared hooks
import { useWorkoutList } from '@/hooks/useWorkoutList';

// Miniprogram-specific API (with Taro HTTP client)
import { workoutApi } from '@mini/services/api';
```

## Using Shared Hooks

Example: Using `useWorkoutList` hook in a Miniprogram page:

```typescript
import Taro from '@tarojs/taro';
import { useWorkoutList } from '@/hooks/useWorkoutList';
import { workoutApi } from '@mini/services/api';

const WorkoutList = () => {
  const { workouts, loading, deleteWorkout } = useWorkoutList({
    workoutApi,
    onError: (msg) => Taro.showToast({ title: msg, icon: 'error' }),
    onSuccess: (msg) => Taro.showToast({ title: msg, icon: 'success' }),
  });

  // Render with Taro components
  return (
    <View>
      {workouts.map(workout => (
        <View key={workout.id}>{workout.routine?.name}</View>
      ))}
    </View>
  );
};
```

## Shared Theme Colors

The miniprogram uses the same color palette as the Web version through SCSS variables:

```scss
@import '@/theme/colors.scss';

.my-component {
  background-color: $primary;
  color: $text-primary;
}
```

Available color variables:
- `$primary`, `$primary-light`, `$primary-dark`
- `$success`, `$warning`, `$error`, `$info`
- `$text-primary`, `$text-secondary`
- `$bg-default`, `$bg-paper`
- Brand colors: `$brand-50` to `$brand-900`
- Gray scale: `$gray-50` to `$gray-900`

## Taro UI Components

Use Taro's built-in components instead of HTML elements:

| HTML | Taro Component |
|------|---------------|
| `<div>` | `<View>` |
| `<span>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |

Import from `@tarojs/components`:
```typescript
import { View, Text, Button } from '@tarojs/components';
```

## WeChat Developer Tools

1. Open WeChat Developer Tools
2. Import project → Select `miniprogram/dist` directory
3. AppID: Use test AppID or your registered AppID
4. Project name: Your project name

## Key Differences from Web

| Feature | Web | Miniprogram |
|---------|-----|-------------|
| HTTP Client | Axios | Taro.request |
| Routing | React Router | Taro.navigateTo |
| UI Library | Material-UI | Taro Components |
| Styling | CSS/SCSS | SCSS (rpx units) |
| Storage | localStorage | Taro.setStorageSync |
| Notifications | MUI Snackbar | Taro.showToast |

## Path Aliases

- `@/` → Points to shared `frontend/src/`
- `@mini/` → Points to miniprogram-specific `miniprogram/src/`

Configured in:
- `tsconfig.json` (TypeScript)
- `config/index.ts` (Webpack)

## Build Configuration

The Taro config (`config/index.ts`) includes:
- Path aliases to shared code
- SCSS auto-import of shared colors
- WeChat miniprogram specific settings
- H5 build configuration for testing

## Notes

- Use `rpx` units for responsive layouts (750rpx = device width)
- Miniprogram has strict file size limits (~2MB per package)
- Some Web APIs are not available (use Taro APIs instead)
- Test on real devices for best results
