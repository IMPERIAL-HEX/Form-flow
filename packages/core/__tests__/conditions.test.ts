import { describe, expect, it } from 'vitest';

import { evaluateCondition } from '../src/engine/conditions';

describe('evaluateCondition', () => {
  it('supports comparison operators', () => {
    const values = { amount: 5000 };

    expect(evaluateCondition({ field: 'amount', operator: 'eq', value: 5000 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'amount', operator: 'neq', value: 4000 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'amount', operator: 'gt', value: 4000 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'amount', operator: 'gte', value: 5000 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'amount', operator: 'lt', value: 7000 }, values)).toBe(true);
    expect(evaluateCondition({ field: 'amount', operator: 'lte', value: 5000 }, values)).toBe(true);
  });

  it('supports in and notIn operators', () => {
    const values = { status: 'employed' };

    expect(
      evaluateCondition(
        { field: 'status', operator: 'in', value: ['employed', 'student'] },
        values,
      ),
    ).toBe(true);

    expect(
      evaluateCondition(
        { field: 'status', operator: 'notIn', value: ['retired', 'unemployed'] },
        values,
      ),
    ).toBe(true);
  });

  it('supports exists operator', () => {
    const values = { present: 'yes', empty: '' };

    expect(evaluateCondition({ field: 'present', operator: 'exists' }, values)).toBe(true);
    expect(evaluateCondition({ field: 'empty', operator: 'exists' }, values)).toBe(false);
    expect(evaluateCondition({ field: 'missing', operator: 'exists' }, values)).toBe(false);
  });

  it('supports nested and/or composition', () => {
    const values = {
      status: 'employed',
      income: 4000,
      country: 'UK',
    };

    const condition = {
      field: 'status',
      operator: 'eq' as const,
      value: 'employed',
      and: [{ field: 'income', operator: 'gte' as const, value: 3000 }],
      or: [{ field: 'country', operator: 'eq' as const, value: 'UK' }],
    };

    expect(evaluateCondition(condition, values)).toBe(true);
  });

  it('returns false for invalid numeric comparisons and unknown operators', () => {
    const values = { amount: 'abc' };

    expect(evaluateCondition({ field: 'amount', operator: 'gt', value: 1000 }, values)).toBe(false);
    expect(
      evaluateCondition(
        { field: 'amount', operator: 'unknown' as unknown as 'eq', value: 1000 },
        values,
      ),
    ).toBe(false);
  });
});
