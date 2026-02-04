// Shared design tokens - spacing, typography, shapes
// Can be used by both Web and Miniprogram platforms

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
};

export const typography = {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        h1: 48,
        h2: 36,
        h3: 30,
        h4: 24,
        h5: 20,
        h6: 18,
    },
    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
    },
};

export const shadows = {
    sm: 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    md: 'hsla(220, 30%, 5%, 0.12) 0px 8px 24px 0px',
    lg: 'hsla(220, 30%, 5%, 0.16) 0px 16px 48px 0px',
};
