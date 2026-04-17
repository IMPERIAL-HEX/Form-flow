import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FormFlow | Schema-Driven Application Forms',
  description:
    'Headless TypeScript form engine with React SDK, live playground, and iframe embedding for lending workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
