'use client';

import type {
  AddressFieldSchema,
  CheckboxFieldSchema,
  CurrencyFieldSchema,
  DateFieldSchema,
  FieldSchema,
  FileUploadFieldSchema,
  FormSchema,
  InfoBlockSchema,
  MultiSelectFieldSchema,
  NumberFieldSchema,
  PhoneFieldSchema,
  SelectFieldSchema,
  SelectOption,
  TextAreaFieldSchema,
  TextFieldSchema,
} from '@formflow/core';

import { buildBlankField } from '@/lib/builder/fieldDefaults';
import { FIELD_TYPE_META, FIELD_TYPE_ORDER, type FieldType } from '@/lib/builder/fieldTypeMeta';
import { schemaHasFieldKey } from '@/lib/builder/schemaMutations';

import { OptionListEditor } from './OptionListEditor';

interface FieldPropertiesProps {
  schema: FormSchema;
  stepId: string;
  field: FieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
  onReplace: (nextField: FieldSchema) => void;
}

export function FieldProperties({
  schema,
  stepId,
  field,
  onUpdate,
  onReplace,
}: FieldPropertiesProps): React.ReactNode {
  const meta = FIELD_TYPE_META[field.type];
  const keyConflict = schemaHasFieldKey(schema, field.key, stepId, field.key)
    ? 'Field key already exists in this form.'
    : null;

  const handleChangeType = (nextType: FieldType): void => {
    if (nextType === field.type) return;
    const blank = buildBlankField(nextType);
    const next: FieldSchema = {
      ...blank,
      key: field.key,
      label: field.label,
      description: field.description,
      required: field.required,
      placeholder: field.placeholder,
      ui: field.ui,
      showIf: field.showIf,
    } as FieldSchema;
    onReplace(next);
  };

  return (
    <div className="ff-builder-properties-body">
      <h3 className="ff-builder-properties-heading">
        <span className="ff-builder-field-glyph" aria-hidden="true">
          {meta.glyph}
        </span>
        {meta.label} field
      </h3>

      <label className="ff-builder-field-group">
        <span>Type</span>
        <select
          className="ff-builder-input"
          value={field.type}
          onChange={(event) => handleChangeType(event.target.value as FieldType)}
          aria-label="Field type"
        >
          {FIELD_TYPE_ORDER.map((type) => (
            <option key={type} value={type}>
              {FIELD_TYPE_META[type].label}
            </option>
          ))}
        </select>
        <small className="ff-builder-field-hint">{meta.description}</small>
      </label>

      <label className="ff-builder-field-group">
        <span>Key</span>
        <input
          className="ff-builder-input"
          type="text"
          value={field.key}
          onChange={(event) => onUpdate({ key: event.target.value })}
        />
        {keyConflict ? (
          <small className="ff-builder-field-error">{keyConflict}</small>
        ) : (
          <small className="ff-builder-field-hint">
            Used as the JSON key when the form submits.
          </small>
        )}
      </label>

      <label className="ff-builder-field-group">
        <span>Label</span>
        <input
          className="ff-builder-input"
          type="text"
          value={field.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
        />
      </label>

      <label className="ff-builder-field-group">
        <span>Description</span>
        <textarea
          className="ff-builder-input ff-builder-textarea"
          rows={2}
          value={field.description ?? ''}
          onChange={(event) =>
            onUpdate({
              description: event.target.value.length ? event.target.value : undefined,
            })
          }
          placeholder="Helper text shown under the field"
        />
      </label>

      {field.type !== 'info' && field.type !== 'checkbox' ? (
        <label className="ff-builder-field-group">
          <span>Placeholder</span>
          <input
            className="ff-builder-input"
            type="text"
            value={field.placeholder ?? ''}
            onChange={(event) =>
              onUpdate({
                placeholder: event.target.value.length ? event.target.value : undefined,
              })
            }
          />
        </label>
      ) : null}

      {field.type !== 'info' ? (
        <label className="ff-builder-field-row">
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={(event) => onUpdate({ required: event.target.checked || undefined })}
          />
          <span>Required</span>
        </label>
      ) : null}

      <label className="ff-builder-field-group">
        <span>Width</span>
        <select
          className="ff-builder-input"
          value={field.ui?.width ?? 'full'}
          onChange={(event) => {
            const width = event.target.value as 'full' | 'half' | 'third';
            onUpdate({ ui: { ...(field.ui ?? {}), width } });
          }}
          aria-label="Field width"
        >
          <option value="full">Full</option>
          <option value="half">Half</option>
          <option value="third">Third</option>
        </select>
      </label>

      <TypeSpecificEditor field={field} onUpdate={onUpdate} />
    </div>
  );
}

interface TypeSpecificEditorProps {
  field: FieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}

function TypeSpecificEditor({ field, onUpdate }: TypeSpecificEditorProps): React.ReactNode {
  switch (field.type) {
    case 'text':
      return <TextEditor field={field} onUpdate={onUpdate} />;
    case 'textarea':
      return <TextAreaEditor field={field} onUpdate={onUpdate} />;
    case 'email':
      return null;
    case 'number':
      return <NumberEditor field={field} onUpdate={onUpdate} />;
    case 'currency':
      return <CurrencyEditor field={field} onUpdate={onUpdate} />;
    case 'select':
      return <SelectEditor field={field} onUpdate={onUpdate} />;
    case 'multi-select':
      return <MultiSelectEditor field={field} onUpdate={onUpdate} />;
    case 'date':
      return <DateEditor field={field} onUpdate={onUpdate} />;
    case 'phone':
      return <PhoneEditor field={field} onUpdate={onUpdate} />;
    case 'file':
      return <FileEditor field={field} onUpdate={onUpdate} />;
    case 'address':
      return <AddressEditor field={field} onUpdate={onUpdate} />;
    case 'checkbox':
      return <CheckboxEditor field={field} onUpdate={onUpdate} />;
    case 'info':
      return <InfoEditor field={field} onUpdate={onUpdate} />;
  }
}

function optionalNumber(value: string): number | undefined {
  if (value.length === 0) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function TextEditor({
  field,
  onUpdate,
}: {
  field: TextFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Text constraints</legend>
      <div className="ff-builder-field-pair">
        <label className="ff-builder-field-group">
          <span>Min length</span>
          <input
            className="ff-builder-input"
            type="number"
            min={0}
            value={field.minLength ?? ''}
            onChange={(event) => onUpdate({ minLength: optionalNumber(event.target.value) })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Max length</span>
          <input
            className="ff-builder-input"
            type="number"
            min={0}
            value={field.maxLength ?? ''}
            onChange={(event) => onUpdate({ maxLength: optionalNumber(event.target.value) })}
          />
        </label>
      </div>
      <label className="ff-builder-field-group">
        <span>Pattern (regex)</span>
        <input
          className="ff-builder-input"
          type="text"
          value={field.pattern ?? ''}
          placeholder="^[A-Z]{2}\d{4}$"
          onChange={(event) =>
            onUpdate({ pattern: event.target.value.length ? event.target.value : undefined })
          }
        />
      </label>
      <label className="ff-builder-field-group">
        <span>Pattern hint</span>
        <input
          className="ff-builder-input"
          type="text"
          value={field.patternHint ?? ''}
          placeholder="Shown when the pattern fails"
          onChange={(event) =>
            onUpdate({
              patternHint: event.target.value.length ? event.target.value : undefined,
            })
          }
        />
      </label>
    </fieldset>
  );
}

function TextAreaEditor({
  field,
  onUpdate,
}: {
  field: TextAreaFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Text area</legend>
      <div className="ff-builder-field-pair">
        <label className="ff-builder-field-group">
          <span>Min length</span>
          <input
            className="ff-builder-input"
            type="number"
            min={0}
            value={field.minLength ?? ''}
            onChange={(event) => onUpdate({ minLength: optionalNumber(event.target.value) })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Max length</span>
          <input
            className="ff-builder-input"
            type="number"
            min={0}
            value={field.maxLength ?? ''}
            onChange={(event) => onUpdate({ maxLength: optionalNumber(event.target.value) })}
          />
        </label>
      </div>
      <label className="ff-builder-field-group">
        <span>Rows</span>
        <input
          className="ff-builder-input"
          type="number"
          min={1}
          value={field.rows ?? ''}
          onChange={(event) => onUpdate({ rows: optionalNumber(event.target.value) })}
        />
      </label>
    </fieldset>
  );
}

function NumberEditor({
  field,
  onUpdate,
}: {
  field: NumberFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Number range</legend>
      <div className="ff-builder-field-pair">
        <label className="ff-builder-field-group">
          <span>Minimum</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.min ?? ''}
            onChange={(event) => onUpdate({ min: optionalNumber(event.target.value) })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Maximum</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.max ?? ''}
            onChange={(event) => onUpdate({ max: optionalNumber(event.target.value) })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Step</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.step ?? ''}
            onChange={(event) => onUpdate({ step: optionalNumber(event.target.value) })}
          />
        </label>
      </div>
    </fieldset>
  );
}

function CurrencyEditor({
  field,
  onUpdate,
}: {
  field: CurrencyFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  const parseQuickSelect = (input: string): number[] | undefined => {
    const values = input
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map(Number)
      .filter((value) => Number.isFinite(value));
    return values.length ? values : undefined;
  };

  return (
    <fieldset className="ff-builder-field-group">
      <legend>Currency</legend>
      <label className="ff-builder-field-group">
        <span>Currency code</span>
        <input
          className="ff-builder-input"
          type="text"
          maxLength={3}
          value={field.currency}
          onChange={(event) => onUpdate({ currency: event.target.value.toUpperCase() })}
          placeholder="GBP"
        />
      </label>
      <div className="ff-builder-field-pair">
        <label className="ff-builder-field-group">
          <span>Minimum</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.min}
            onChange={(event) => onUpdate({ min: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Maximum</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.max}
            onChange={(event) => onUpdate({ max: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Step</span>
          <input
            className="ff-builder-input"
            type="number"
            value={field.step ?? ''}
            onChange={(event) => onUpdate({ step: optionalNumber(event.target.value) })}
          />
        </label>
      </div>
      <label className="ff-builder-field-group">
        <span>Quick-select amounts (comma separated)</span>
        <input
          className="ff-builder-input"
          type="text"
          value={(field.quickSelect ?? []).join(', ')}
          placeholder="1000, 2500, 5000"
          onChange={(event) => onUpdate({ quickSelect: parseQuickSelect(event.target.value) })}
        />
      </label>
    </fieldset>
  );
}

function SelectEditor({
  field,
  onUpdate,
}: {
  field: SelectFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <OptionListEditor
      options={field.options}
      onChange={(options) => onUpdate({ options } as Partial<SelectFieldSchema>)}
    />
  );
}

function MultiSelectEditor({
  field,
  onUpdate,
}: {
  field: MultiSelectFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <>
      <OptionListEditor
        options={field.options}
        onChange={(options) => onUpdate({ options } as Partial<MultiSelectFieldSchema>)}
      />
      <fieldset className="ff-builder-field-group">
        <legend>Selection limits</legend>
        <div className="ff-builder-field-pair">
          <label className="ff-builder-field-group">
            <span>Min selections</span>
            <input
              className="ff-builder-input"
              type="number"
              min={0}
              value={field.minSelections ?? ''}
              onChange={(event) =>
                onUpdate({ minSelections: optionalNumber(event.target.value) })
              }
            />
          </label>
          <label className="ff-builder-field-group">
            <span>Max selections</span>
            <input
              className="ff-builder-input"
              type="number"
              min={0}
              value={field.maxSelections ?? ''}
              onChange={(event) =>
                onUpdate({ maxSelections: optionalNumber(event.target.value) })
              }
            />
          </label>
        </div>
      </fieldset>
    </>
  );
}

function DateEditor({
  field,
  onUpdate,
}: {
  field: DateFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Date range</legend>
      <div className="ff-builder-field-pair">
        <label className="ff-builder-field-group">
          <span>Earliest</span>
          <input
            className="ff-builder-input"
            type="date"
            value={field.minDate ?? ''}
            onChange={(event) =>
              onUpdate({ minDate: event.target.value.length ? event.target.value : undefined })
            }
          />
        </label>
        <label className="ff-builder-field-group">
          <span>Latest</span>
          <input
            className="ff-builder-input"
            type="date"
            value={field.maxDate ?? ''}
            onChange={(event) =>
              onUpdate({ maxDate: event.target.value.length ? event.target.value : undefined })
            }
          />
        </label>
      </div>
    </fieldset>
  );
}

function PhoneEditor({
  field,
  onUpdate,
}: {
  field: PhoneFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Phone</legend>
      <label className="ff-builder-field-group">
        <span>Default country code</span>
        <input
          className="ff-builder-input"
          type="text"
          maxLength={4}
          value={field.defaultCountryCode ?? ''}
          placeholder="+44"
          onChange={(event) =>
            onUpdate({
              defaultCountryCode: event.target.value.length ? event.target.value : undefined,
            })
          }
        />
      </label>
    </fieldset>
  );
}

function FileEditor({
  field,
  onUpdate,
}: {
  field: FileUploadFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  const parseAccept = (input: string): string[] | undefined => {
    const values = input
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    return values.length ? values : undefined;
  };

  return (
    <fieldset className="ff-builder-field-group">
      <legend>File upload</legend>
      <label className="ff-builder-field-group">
        <span>Accepted types (comma separated)</span>
        <input
          className="ff-builder-input"
          type="text"
          value={(field.accept ?? []).join(', ')}
          placeholder="application/pdf, image/png"
          onChange={(event) =>
            onUpdate({ accept: parseAccept(event.target.value) } as Partial<FileUploadFieldSchema>)
          }
        />
      </label>
      <label className="ff-builder-field-group">
        <span>Max file size (MB)</span>
        <input
          className="ff-builder-input"
          type="number"
          min={0}
          step={0.1}
          value={field.maxSizeMb ?? ''}
          onChange={(event) =>
            onUpdate({ maxSizeMb: optionalNumber(event.target.value) } as Partial<FileUploadFieldSchema>)
          }
        />
      </label>
      <label className="ff-builder-field-row">
        <input
          type="checkbox"
          checked={field.multiple ?? false}
          onChange={(event) =>
            onUpdate({ multiple: event.target.checked || undefined } as Partial<FileUploadFieldSchema>)
          }
        />
        <span>Allow multiple files</span>
      </label>
    </fieldset>
  );
}

function AddressEditor({
  field,
  onUpdate,
}: {
  field: AddressFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  const handleCountries = (options: SelectOption[]): void => {
    onUpdate({ countries: options.length ? options : undefined } as Partial<AddressFieldSchema>);
  };

  return (
    <>
      <fieldset className="ff-builder-field-group">
        <legend>Address</legend>
        <label className="ff-builder-field-row">
          <input
            type="checkbox"
            checked={field.includeLine2 ?? false}
            onChange={(event) =>
              onUpdate({ includeLine2: event.target.checked || undefined } as Partial<AddressFieldSchema>)
            }
          />
          <span>Include address line 2</span>
        </label>
        <div className="ff-builder-field-pair">
          <label className="ff-builder-field-group">
            <span>Region label</span>
            <input
              className="ff-builder-input"
              type="text"
              value={field.regionLabel ?? ''}
              placeholder="State / Province"
              onChange={(event) =>
                onUpdate({
                  regionLabel: event.target.value.length ? event.target.value : undefined,
                } as Partial<AddressFieldSchema>)
              }
            />
          </label>
          <label className="ff-builder-field-group">
            <span>Postcode label</span>
            <input
              className="ff-builder-input"
              type="text"
              value={field.postcodeLabel ?? ''}
              placeholder="Postcode / ZIP"
              onChange={(event) =>
                onUpdate({
                  postcodeLabel: event.target.value.length ? event.target.value : undefined,
                } as Partial<AddressFieldSchema>)
              }
            />
          </label>
        </div>
      </fieldset>
      {field.countries ? (
        <OptionListEditor
          label="Country options (leave empty for free text)"
          options={field.countries}
          onChange={handleCountries}
        />
      ) : (
        <button
          type="button"
          className="ff-builder-button ff-builder-button-subtle"
          onClick={() => handleCountries([{ value: 'GB', label: 'United Kingdom' }])}
        >
          Constrain country to a list
        </button>
      )}
    </>
  );
}

function CheckboxEditor({
  field,
  onUpdate,
}: {
  field: CheckboxFieldSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  void field;
  void onUpdate;
  return (
    <p className="ff-builder-field-hint">
      Checkbox fields have no extra properties — set the label to the confirmation text and toggle Required for consent gates.
    </p>
  );
}

function InfoEditor({
  field,
  onUpdate,
}: {
  field: InfoBlockSchema;
  onUpdate: (patch: Partial<FieldSchema>) => void;
}): React.ReactNode {
  return (
    <fieldset className="ff-builder-field-group">
      <legend>Info block</legend>
      <label className="ff-builder-field-group">
        <span>Variant</span>
        <select
          className="ff-builder-input"
          value={field.variant ?? 'callout'}
          onChange={(event) =>
            onUpdate({
              variant: event.target.value as InfoBlockSchema['variant'],
            } as Partial<InfoBlockSchema>)
          }
        >
          <option value="callout">Callout</option>
          <option value="warning">Warning</option>
          <option value="summary">Summary</option>
        </select>
      </label>
      <label className="ff-builder-field-group">
        <span>Content</span>
        <textarea
          className="ff-builder-input ff-builder-textarea"
          rows={4}
          value={field.content}
          onChange={(event) =>
            onUpdate({ content: event.target.value } as Partial<InfoBlockSchema>)
          }
        />
      </label>
    </fieldset>
  );
}

