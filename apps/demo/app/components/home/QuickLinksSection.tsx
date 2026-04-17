import Link from 'next/link';

import { quickLinks } from '@/lib/docs/content';

import { SectionFrame } from './SectionFrame';

export function QuickLinksSection(): React.ReactNode {
  return (
    <SectionFrame
      id="quick-links"
      eyebrow="Jump Points"
      title="Navigate key surfaces quickly"
      description="Use these links to move between hosted demo routes and in-page docs sections."
    >
      <div className="ff-quick-links-grid">
        {quickLinks.map((item) => (
          <Link key={item.title} href={item.href} className="ff-quick-link-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </SectionFrame>
  );
}
