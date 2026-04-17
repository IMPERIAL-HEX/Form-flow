import { useMemo } from 'react';

import type { ThemeConfig } from '@formflow/core';

import { mergeTheme } from './theme';

export function ThemeProvider({
  theme,
  children,
}: {
  theme?: ThemeConfig;
  children: React.ReactNode;
}): React.ReactNode {
  const cssVars = useMemo(() => mergeTheme(theme), [theme]);

  return <div style={cssVars as React.CSSProperties}>{children}</div>;
}
