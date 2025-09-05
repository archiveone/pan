import { createTheme } from '@/lib/create-theme';

export const theme = createTheme({
  light: {
    background: '#FFFFFF',
    foreground: '#11181C',
    card: '#FFFFFF',
    popover: '#FFFFFF',
    primary: {
      DEFAULT: '#006ADC',
      foreground: '#FFFFFF',
      hover: '#005BC4',
      muted: '#E5F0FF'
    },
    secondary: {
      DEFAULT: '#F1F3F5',
      foreground: '#11181C',
      hover: '#E9ECEF',
      muted: '#F8F9FA'
    },
    muted: {
      DEFAULT: '#F1F3F5',
      foreground: '#687076'
    },
    accent: {
      DEFAULT: '#006ADC',
      foreground: '#FFFFFF'
    },
    destructive: {
      DEFAULT: '#E5484D',
      foreground: '#FFFFFF'
    },
    border: '#E6E8EB',
    input: '#E6E8EB',
    ring: '#006ADC'
  },
  dark: {
    background: '#0C0F12',
    foreground: '#ECEDEE',
    card: '#151819',
    popover: '#151819',
    primary: {
      DEFAULT: '#0091FF',
      foreground: '#FFFFFF',
      hover: '#0081E5',
      muted: '#002A4D'
    },
    secondary: {
      DEFAULT: '#1C1F21',
      foreground: '#ECEDEE',
      hover: '#252829',
      muted: '#151819'
    },
    muted: {
      DEFAULT: '#1C1F21',
      foreground: '#A1A1AA'
    },
    accent: {
      DEFAULT: '#0091FF',
      foreground: '#FFFFFF'
    },
    destructive: {
      DEFAULT: '#E5484D',
      foreground: '#FFFFFF'
    },
    border: '#26292B',
    input: '#26292B',
    ring: '#0091FF'
  }
});

// Professional color palette
export const colors = {
  brand: {
    primary: '#006ADC',
    secondary: '#0091FF',
    accent: '#00B4D8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#E5484D',
    info: '#3B82F6'
  },
  text: {
    primary: '#11181C',
    secondary: '#687076',
    muted: '#889096',
    inverse: '#FFFFFF'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5',
    accent: '#E5F0FF',
    dark: '#0C0F12'
  },
  border: {
    light: '#E6E8EB',
    medium: '#DFE3E6',
    dark: '#C1C8CD'
  },
  status: {
    online: '#10B981',
    away: '#F59E0B',
    busy: '#E5484D',
    offline: '#9CA3AF'
  }
};

// Typography scale
export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace'
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
};

// Transitions
export const transitions = {
  DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070'
};