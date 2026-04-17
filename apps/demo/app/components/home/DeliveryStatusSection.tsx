import { deliveryStages, remainingChecklist } from '@/lib/docs/content';

import { SectionFrame } from './SectionFrame';

function toBadgeLabel(status: 'complete' | 'in-progress' | 'next'): string {
  if (status === 'complete') {
    return 'Complete';
  }

  if (status === 'in-progress') {
    return 'In Progress';
  }

  return 'Next';
}

export function DeliveryStatusSection(): React.ReactNode {
  return (
    <SectionFrame
      id="delivery-status"
      eyebrow="Delivery Status"
      title="Where the project stands right now"
      description="This branch tracks final release polish with explicit scope and quality-gate closure."
    >
      <div className="ff-status-grid">
        {deliveryStages.map((stage) => (
          <article key={stage.phase} className="ff-status-card">
            <header className="ff-status-card-header">
              <h3>{stage.phase}</h3>
              <span className={`ff-status-pill ff-status-${stage.status}`}>
                {toBadgeLabel(stage.status)}
              </span>
            </header>
            <p>{stage.summary}</p>
            <ul>
              {stage.artifacts.map((artifact) => (
                <li key={artifact}>{artifact}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="ff-status-next">
        <h3>Remaining before done</h3>
        <ul>
          {remainingChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </SectionFrame>
  );
}
