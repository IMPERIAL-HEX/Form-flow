import { AnimatePresence, motion } from 'framer-motion';

import { evaluateCondition, type FieldSchema, type StepSchema } from '@formflow/core';

import { resolveFieldComponent, type FieldComponentMap } from '../../registry/registry';

export interface StepRendererProps {
  step: StepSchema;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
  onBlur: (key: string) => void;
  registry?: Partial<FieldComponentMap>;
}

export function StepRenderer({
  step,
  values,
  errors,
  onChange,
  onBlur,
  registry,
}: StepRendererProps): React.ReactNode {
  const visibleFields = step.fields.filter((field) => {
    if (!field.showIf) {
      return true;
    }

    return evaluateCondition(field.showIf, values);
  });

  const rows = groupFieldsByWidth(visibleFields);

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {rows.map((row, rowIndex) => {
          const width = row[0]?.ui?.width ?? 'full';
          const columns =
            width === 'third'
              ? 'repeat(3, minmax(0, 1fr))'
              : width === 'half'
                ? 'repeat(2, minmax(0, 1fr))'
                : '1fr';

          return (
            <div
              key={`row-${rowIndex}`}
              style={{
                display: 'grid',
                gridTemplateColumns: columns,
                gap: '1rem',
              }}
            >
              {row.map((field, fieldIndex) => {
                const Component = resolveFieldComponent(field.type, field.ui?.variant, registry);

                return (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: (rowIndex * 3 + fieldIndex) * 0.05, duration: 0.2 }}
                  >
                    <Component
                      field={field}
                      value={values[field.key]}
                      error={errors[field.key] ?? null}
                      onChange={(nextValue) => onChange(field.key, nextValue)}
                      onBlur={() => onBlur(field.key)}
                    />
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function groupFieldsByWidth(fields: FieldSchema[]): FieldSchema[][] {
  const rows: FieldSchema[][] = [];

  let index = 0;
  while (index < fields.length) {
    const field = fields[index];
    if (!field) {
      break;
    }

    const width = field.ui?.width ?? 'full';

    if (width === 'full') {
      rows.push([field]);
      index += 1;
      continue;
    }

    if (width === 'half') {
      const next = fields[index + 1];
      if (next && (next.ui?.width ?? 'full') === 'half') {
        rows.push([field, next]);
        index += 2;
      } else {
        rows.push([field]);
        index += 1;
      }
      continue;
    }

    const thirdRow: FieldSchema[] = [field];
    let step = 1;

    while (step < 3 && index + step < fields.length) {
      const next = fields[index + step];
      if (!next || (next.ui?.width ?? 'full') !== 'third') {
        break;
      }

      thirdRow.push(next);
      step += 1;
    }

    rows.push(thirdRow);
    index += thirdRow.length;
  }

  return rows;
}
