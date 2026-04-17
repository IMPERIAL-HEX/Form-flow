import type { ThemeConfig } from '@formflow/core';

export const defaultTheme = {
  '--ff-primary': '#0d9488',
  '--ff-primary-light': '#ccfbf1',
  '--ff-primary-dark': '#0f766e',
  '--ff-error': '#ef4444',
  '--ff-text': '#111827',
  '--ff-text-muted': '#6b7280',
  '--ff-bg': '#ffffff',
  '--ff-bg-page': '#f0fdfa',
  '--ff-bg-card': '#ffffff',
  '--ff-border': '#e5e7eb',
  '--ff-border-focus': 'var(--ff-primary)',
  '--ff-radius': '0.5rem',
  '--ff-radius-lg': '0.75rem',
  '--ff-font-family': "'Inter', system-ui, sans-serif",
  '--ff-font-size-base': '1rem',
  '--ff-transition': '200ms ease',
} as const;

export function mergeTheme(theme?: ThemeConfig): Record<string, string> {
  const merged: Record<string, string> = { ...defaultTheme };

  if (!theme) {
    return merged;
  }

  if (theme.primaryColor) {
    merged['--ff-primary'] = theme.primaryColor;
    merged['--ff-primary-light'] = adjustColor(theme.primaryColor, 0.85);
    merged['--ff-primary-dark'] = adjustColor(theme.primaryColor, -0.15);
  }

  if (theme.borderRadius) {
    merged['--ff-radius'] = mapRadius(theme.borderRadius);
  }

  if (theme.fontFamily) {
    merged['--ff-font-family'] = theme.fontFamily;
  }

  if (theme.mode === 'dark') {
    merged['--ff-text'] = '#f3f4f6';
    merged['--ff-text-muted'] = '#9ca3af';
    merged['--ff-bg'] = '#111827';
    merged['--ff-bg-page'] = '#030712';
    merged['--ff-bg-card'] = '#1f2937';
    merged['--ff-border'] = '#374151';
  }

  return merged;
}

function mapRadius(radius: NonNullable<ThemeConfig['borderRadius']>): string {
  switch (radius) {
    case 'none':
      return '0';
    case 'sm':
      return '0.25rem';
    case 'md':
      return '0.5rem';
    case 'lg':
      return '0.75rem';
    case 'full':
      return '9999px';
    default:
      return defaultTheme['--ff-radius'];
  }
}

function adjustColor(hex: string, amount: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return hex;
  }

  const [r, g, b] = normalized;

  const next = [r, g, b].map((channel) => {
    if (amount >= 0) {
      return Math.round(channel + (255 - channel) * amount);
    }

    return Math.round(channel * (1 + amount));
  });

  return `#${next.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function normalizeHex(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '');

  if (raw.length !== 6 && raw.length !== 3) {
    return null;
  }

  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw;

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return [r, g, b];
}
