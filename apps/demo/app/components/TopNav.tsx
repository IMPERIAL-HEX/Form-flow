'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS: Array<{ href: string; label: string; match: (pathname: string) => boolean }> = [
  { href: '/', label: 'Home', match: (pathname) => pathname === '/' },
  { href: '/demo', label: 'Demo', match: (pathname) => pathname.startsWith('/demo') },
  { href: '/playground', label: 'Playground', match: (pathname) => pathname.startsWith('/playground') },
  { href: '/builder', label: 'Builder', match: (pathname) => pathname.startsWith('/builder') },
  { href: '/analytics', label: 'Analytics', match: (pathname) => pathname.startsWith('/analytics') },
];

export function TopNav(): React.ReactNode {
  const pathname = usePathname() ?? '/';

  if (pathname.startsWith('/embed')) {
    return null;
  }

  return (
    <nav className="ff-topnav" aria-label="Primary">
      <Link href="/" className="ff-topnav-brand">
        FormFlow
      </Link>
      <ul className="ff-topnav-links">
        {NAV_LINKS.map((link) => {
          const active = link.match(pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`ff-topnav-link${active ? ' ff-topnav-link-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
