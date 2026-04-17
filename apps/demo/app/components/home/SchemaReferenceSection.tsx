import { schemaFieldReference } from '@/lib/docs/content';

import { CodeBlock } from './CodeBlock';
import { SectionFrame } from './SectionFrame';

export function SchemaReferenceSection(): React.ReactNode {
  return (
    <SectionFrame
      id="schema-reference"
      eyebrow="Schema Reference"
      title="Core field primitives and conditional logic"
      description="Field definitions are composable and can be extended with variants through the registry."
    >
      <div className="ff-schema-accordion">
        {schemaFieldReference.map((item, index) => (
          <details key={item.field} className="ff-schema-item" open={index === 0}>
            <summary>
              <span>{item.field}</span>
              <small>{item.summary}</small>
            </summary>
            <CodeBlock code={item.example} language="json" />
          </details>
        ))}
      </div>
    </SectionFrame>
  );
}
