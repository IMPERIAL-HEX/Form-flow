import { faqItems } from '@/lib/docs/content';

import { SectionFrame } from './SectionFrame';

export function FaqSection(): React.ReactNode {
  return (
    <SectionFrame
      id="faq"
      eyebrow="FAQ"
      title="Frequently asked implementation questions"
      description="Answers to common architecture, validation, and integration questions."
    >
      <div className="ff-faq-grid">
        {faqItems.map((item, index) => (
          <details key={item.question} className="ff-faq-item" open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionFrame>
  );
}
