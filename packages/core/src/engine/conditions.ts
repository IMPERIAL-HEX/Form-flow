import type { Condition } from '../schema/types';

/**
 * Evaluates a schema condition against current form values.
 */
export function evaluateCondition(condition: Condition, values: Record<string, unknown>): boolean {
  const fieldValue = getValueAtPath(values, condition.field);
  let result = evaluateOperator(condition.operator, fieldValue, condition.value);

  if (condition.and && condition.and.length > 0) {
    result = result && condition.and.every((entry) => evaluateCondition(entry, values));
  }

  if (condition.or && condition.or.length > 0) {
    result = result && condition.or.some((entry) => evaluateCondition(entry, values));
  }

  return result;
}

function evaluateOperator(operator: Condition['operator'], left: unknown, right: unknown): boolean {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return compareAsNumber(left, right, (a, b) => a > b);
    case 'gte':
      return compareAsNumber(left, right, (a, b) => a >= b);
    case 'lt':
      return compareAsNumber(left, right, (a, b) => a < b);
    case 'lte':
      return compareAsNumber(left, right, (a, b) => a <= b);
    case 'in':
      return Array.isArray(right) ? right.includes(left) : false;
    case 'notIn':
      return Array.isArray(right) ? !right.includes(left) : true;
    case 'exists':
      return left !== undefined && left !== null && left !== '';
    default:
      return false;
  }
}

function compareAsNumber(
  left: unknown,
  right: unknown,
  comparator: (a: number, b: number) => boolean,
): boolean {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isNaN(leftNumber) || Number.isNaN(rightNumber)) {
    return false;
  }

  return comparator(leftNumber, rightNumber);
}

function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  if (path in obj) {
    return obj[path];
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, obj);
}
