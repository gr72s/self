// Test setup file
import { vi } from 'vitest';

// Global test setup
globalThis.console = {
    ...console,
    error: vi.fn(console.error),
    warn: vi.fn(console.warn),
};
