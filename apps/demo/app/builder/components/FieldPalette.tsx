'use client';

import { FIELD_TYPE_META, FIELD_TYPE_ORDER, type FieldType } from '@/lib/builder/fieldTypeMeta';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps): React.ReactNode {
  return (
    <div className="ff-builder-palette" aria-label="Field palette">
      <h3 className="ff-builder-palette-title">Add field</h3>
      <div className="ff-builder-palette-grid">
        {FIELD_TYPE_ORDER.map((type) => {
          const meta = FIELD_TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              className="ff-builder-palette-item"
              onClick={() => onAddField(type)}
              title={meta.description}
            >
              <span className="ff-builder-palette-glyph" aria-hidden="true">
                {meta.glyph}
              </span>
              <span className="ff-builder-palette-label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
