import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FormFlow Demo',
  description: 'Schema-driven multi-step forms for financial workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
