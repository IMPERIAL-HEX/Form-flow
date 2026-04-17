interface SectionFrameProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionFrame({
  id,
  eyebrow,
  title,
  description,
  children,
}: SectionFrameProps): React.ReactNode {
  return (
    <section id={id} className="ff-section">
      <header className="ff-section-header">
        {eyebrow ? <p className="ff-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
