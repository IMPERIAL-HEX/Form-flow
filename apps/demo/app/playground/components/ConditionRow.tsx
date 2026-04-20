'use client';

import {
  operatorLabel,
  operatorsForField,
  type ConditionOperator,
  type FieldRef,
  type RowDraft,
} from '@/lib/schemas/conditionBuilderUtils';

interface ConditionRowProps {
  row: RowDraft;
  fields: FieldRef[];
  index: number;
  canRemove: boolean;
  onChange: (next: RowDraft) => void;
  onRemove: () => void;
}

export function ConditionRow({
  row,
  fields,
  index,
  canRemove,
  onChange,
  onRemove,
}: ConditionRowProps): React.ReactNode {
  const selectedField = fields.find((entry) => entry.key === row.field);
  const operators = operatorsForField(selectedField);

  const handleFieldChange = (value: string): void => {
    const nextField = fields.find((entry) => entry.key === value);
    const nextOperators = operatorsForField(nextField);
    const nextOperator = nextOperators.includes(row.operator) ? row.operator : nextOperators[0];
    onChange({ ...row, field: value, operator: nextOperator ?? 'eq', value: '' });
  };

  const handleOperatorChange = (value: ConditionOperator): void => {
    onChange({ ...row, operator: value, value: value === 'exists' ? '' : row.value });
  };

  const handleValueChange = (value: string): void => {
    onChange({ ...row, value });
  };

  const needsValue = row.operator !== 'exists';
  const isList = row.operator === 'in' || row.operator === 'notIn';

  const rowId = `ff-cb-row-${index}`;
  const fieldId = `${rowId}-field`;
  const operatorId = `${rowId}-operator`;
  const valueId = `${rowId}-value`;

  return (
    <div className="ff-cb-row" data-row-index={index}>
      <div className="ff-cb-cell">
        <label className="ff-cb-cell-label" htmlFor={fieldId}>
          When field
        </label>
        <select
          id={fieldId}
          className="ff-cb-input"
          value={row.field}
          onChange={(event) => handleFieldChange(event.target.value)}
        >
          <option value="">Select a field…</option>
          {groupFields(fields).map((group) => (
            <optgroup key={group.stepId} label={group.stepTitle}>
              {group.fields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="ff-cb-cell">
        <label className="ff-cb-cell-label" htmlFor={operatorId}>
          Operator
        </label>
        <select
          id={operatorId}
          className="ff-cb-input"
          value={row.operator}
          onChange={(event) => handleOperatorChange(event.target.value as ConditionOperator)}
          disabled={!row.field}
        >
          {operators.map((operator) => (
            <option key={operator} value={operator}>
              {operatorLabel(operator)}
            </option>
          ))}
        </select>
      </div>

      <div className="ff-cb-cell">
        <label className="ff-cb-cell-label" htmlFor={valueId}>
          Value
        </label>
        {renderValueInput({
          id: valueId,
          row,
          field: selectedField,
          isList,
          disabled: !needsValue,
          onChange: handleValueChange,
        })}
      </div>

      <div className="ff-cb-cell ff-cb-cell-actions">
        <button
          type="button"
          className="ff-cb-remove"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove condition row ${index + 1}`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

interface RenderValueInputParams {
  id: string;
  row: RowDraft;
  field: FieldRef | undefined;
  isList: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}

function renderValueInput({
  id,
  row,
  field,
  isList,
  disabled,
  onChange,
}: RenderValueInputParams): React.ReactNode {
  if (disabled) {
    return (
      <input
        id={id}
        className="ff-cb-input"
        type="text"
        value=""
        disabled
        placeholder="No value needed"
      />
    );
  }

  if (field && (field.type === 'select' || field.type === 'multi-select') && !isList) {
    return (
      <select
        id={id}
        className="ff-cb-input"
        value={row.value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select an option…</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field && field.type === 'checkbox' && !isList) {
    return (
      <select
        id={id}
        className="ff-cb-input"
        value={row.value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  if (field && (field.type === 'number' || field.type === 'currency') && !isList) {
    return (
      <input
        id={id}
        className="ff-cb-input"
        type="number"
        value={row.value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. 500"
      />
    );
  }

  return (
    <input
      id={id}
      className="ff-cb-input"
      type="text"
      value={row.value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={isList ? 'comma,separated,values' : 'value'}
    />
  );
}

interface FieldGroup {
  stepId: string;
  stepTitle: string;
  fields: FieldRef[];
}

function groupFields(fields: FieldRef[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  for (const field of fields) {
    let group = groups.find((entry) => entry.stepId === field.stepId);
    if (!group) {
      group = { stepId: field.stepId, stepTitle: field.stepTitle, fields: [] };
      groups.push(group);
    }
    group.fields.push(field);
  }
  return groups;
}
