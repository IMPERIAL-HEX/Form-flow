import type { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  content?: ReactNode;
}

export function FeatureCard({ title, description, content }: FeatureCardProps): React.ReactNode {
  return (
    <article className="ff-feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {content ? <div className="ff-feature-content">{content}</div> : null}
    </article>
  );
}
