import { describe, expect, it } from 'vitest';

import { parseFormSchema, SchemaParseError } from '../src/schema/parser';
import { baseSchema } from './fixtures/schema';

describe('parseFormSchema', () => {
  it('parses a valid schema and returns a frozen object', () => {
    const parsed = parseFormSchema(structuredClone(baseSchema));

    expect(parsed.id).toBe('education-loan');
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.steps)).toBe(true);
  });

  it('throws on duplicate field keys', () => {
    const invalid = structuredClone(baseSchema);
    invalid.steps[1].fields[0].key = 'loan.amount';

    expect(() => parseFormSchema(invalid)).toThrow(SchemaParseError);
  });

  it('throws when showIf references missing preceding fields', () => {
    const invalid = structuredClone(baseSchema);
    invalid.steps[2].showIf = {
      field: 'employment.missingField',
      operator: 'eq',
      value: 'x',
    };

    expect(() => parseFormSchema(invalid)).toThrow(/showIf condition/i);
  });

  it('throws when currency quickSelect values are outside range', () => {
    const invalid = structuredClone(baseSchema);
    const currencyField = invalid.steps[0].fields[0];

    if (currencyField.type === 'currency') {
      currencyField.quickSelect = [1000, 12000];
    }

    expect(() => parseFormSchema(invalid)).toThrow(/quickSelect/i);
  });
});
