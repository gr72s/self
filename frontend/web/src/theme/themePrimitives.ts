// Web platform MUI theme configuration
// Uses shared colors from @/theme/colors

import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode, Shadows } from '@mui/material/styles';
import { brand, gray, green, orange, red } from '@web/theme/colors';
import { borderRadius, typography as sharedTypography } from '@web/theme/tokens';

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        highlighted: true;
    }
}

declare module '@mui/material/styles' {
    interface ColorRange {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    }

    interface PaletteColor extends ColorRange { }

    interface Palette {
        baseShadow: string;
    }
}

const defaultTheme = createTheme();
const customShadows: Shadows = [...defaultTheme.shadows];

export const getDesignTokens = (mode: PaletteMode) => {
    customShadows[1] =
        mode === 'dark'
            ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
            : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

    return {
        palette: {
            mode,
            primary: {
                light: brand[200],
                main: brand[400],
                dark: brand[700],
                contrastText: brand[50],
                ...(mode === 'dark' && {
                    contrastText: brand[50],
                    light: brand[300],
                    main: brand[400],
                    dark: brand[700],
                }),
            },
            info: {
                light: brand[100],
                main: brand[300],
                dark: brand[600],
                contrastText: gray[50],
                ...(mode === 'dark' && {
                    contrastText: brand[300],
                    light: brand[500],
                    main: brand[700],
                    dark: brand[900],
                }),
            },
            warning: {
                light: orange[300],
                main: orange[400],
                dark: orange[800],
                ...(mode === 'dark' && {
                    light: orange[400],
                    main: orange[500],
                    dark: orange[700],
                }),
            },
            error: {
                light: red[300],
                main: red[400],
                dark: red[800],
                ...(mode === 'dark' && {
                    light: red[400],
                    main: red[500],
                    dark: red[700],
                }),
            },
            success: {
                light: green[300],
                main: green[400],
                dark: green[800],
                ...(mode === 'dark' && {
                    light: green[400],
                    main: green[500],
                    dark: green[700],
                }),
            },
            grey: {
                ...gray,
            },
            divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
            background: {
                default: 'hsl(0, 0%, 99%)',
                paper: 'hsl(220, 35%, 97%)',
                ...(mode === 'dark' && { default: gray[900], paper: 'hsl(220, 30%, 7%)' }),
            },
            text: {
                primary: gray[800],
                secondary: gray[600],
                warning: orange[400],
                ...(mode === 'dark' && { primary: 'hsl(0, 0%, 100%)', secondary: gray[400] }),
            },
            action: {
                hover: alpha(gray[200], 0.2),
                selected: `${alpha(gray[200], 0.3)}`,
                ...(mode === 'dark' && {
                    hover: alpha(gray[600], 0.2),
                    selected: alpha(gray[600], 0.3),
                }),
            },
        },
        typography: {
            fontFamily: sharedTypography.fontFamily,
            h1: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h1),
                fontWeight: sharedTypography.fontWeight.semibold,
                lineHeight: sharedTypography.lineHeight.tight,
                letterSpacing: -0.5,
            },
            h2: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h2),
                fontWeight: sharedTypography.fontWeight.semibold,
                lineHeight: sharedTypography.lineHeight.tight,
            },
            h3: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h3),
                lineHeight: sharedTypography.lineHeight.tight,
            },
            h4: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h4),
                fontWeight: sharedTypography.fontWeight.semibold,
                lineHeight: sharedTypography.lineHeight.normal,
            },
            h5: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h5),
                fontWeight: sharedTypography.fontWeight.semibold,
            },
            h6: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.h6),
                fontWeight: sharedTypography.fontWeight.semibold,
            },
            subtitle1: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.lg),
            },
            subtitle2: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.sm),
                fontWeight: sharedTypography.fontWeight.medium,
            },
            body1: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.sm),
            },
            body2: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.sm),
                fontWeight: sharedTypography.fontWeight.regular,
            },
            caption: {
                fontSize: defaultTheme.typography.pxToRem(sharedTypography.fontSize.xs),
                fontWeight: sharedTypography.fontWeight.regular,
            },
        },
        shape: {
            borderRadius: borderRadius.md,
        },
        shadows: customShadows,
    };
};

export const colorSchemes = {
    light: {
        palette: {
            primary: {
                light: brand[200],
                main: brand[400],
                dark: brand[700],
                contrastText: brand[50],
            },
            info: {
                light: brand[100],
                main: brand[300],
                dark: brand[600],
                contrastText: gray[50],
            },
            warning: {
                light: orange[300],
                main: orange[400],
                dark: orange[800],
            },
            error: {
                light: red[300],
                main: red[400],
                dark: red[800],
            },
            success: {
                light: green[300],
                main: green[400],
                dark: green[800],
            },
            grey: {
                ...gray,
            },
            divider: alpha(gray[300], 0.4),
            background: {
                default: 'hsl(0, 0%, 99%)',
                paper: 'hsl(220, 35%, 97%)',
            },
            text: {
                primary: gray[800],
                secondary: gray[600],
                warning: orange[400],
            },
            action: {
                hover: alpha(gray[200], 0.2),
                selected: `${alpha(gray[200], 0.3)}`,
            },
            baseShadow:
                'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
        },
    },
    dark: {
        palette: {
            primary: {
                contrastText: brand[50],
                light: brand[300],
                main: brand[400],
                dark: brand[700],
            },
            info: {
                contrastText: brand[300],
                light: brand[500],
                main: brand[700],
                dark: brand[900],
            },
            warning: {
                light: orange[400],
                main: orange[500],
                dark: orange[700],
            },
            error: {
                light: red[400],
                main: red[500],
                dark: red[700],
            },
            success: {
                light: green[400],
                main: green[500],
                dark: green[700],
            },
            grey: {
                ...gray,
            },
            divider: alpha(gray[700], 0.6),
            background: {
                default: gray[900],
                paper: 'hsl(220, 30%, 7%)',
            },
            text: {
                primary: 'hsl(0, 0%, 100%)',
                secondary: gray[400],
            },
            action: {
                hover: alpha(gray[600], 0.2),
                selected: alpha(gray[600], 0.3),
            },
            baseShadow:
                'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
        },
    },
};

export const shape = {
    borderRadius: borderRadius.md,
};

const defaultShadows: Shadows = [
    'none',
    'var(--template-palette-baseShadow)',
    ...defaultTheme.shadows.slice(2),
] as Shadows;

export const shadows = defaultShadows;
