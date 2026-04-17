import { describe, expect, it } from 'vitest';

import {
  buildFieldValidator,
  buildFormValidator,
  buildStepValidator,
} from '../src/validation/validator';
import { baseSchema } from './fixtures/schema';

describe('buildFieldValidator', () => {
  it('validates required text with min and pattern', () => {
    const validator = buildFieldValidator({
      type: 'text',
      key: 'name',
      label: 'Name',
      required: true,
      minLength: 2,
      pattern: '^[A-Za-z ]+$',
    });

    expect(validator.safeParse('John').success).toBe(true);
    expect(validator.safeParse('1').success).toBe(false);
  });

  it('validates select values against enum options', () => {
    const validator = buildFieldValidator({
      type: 'select',
      key: 'status',
      label: 'Status',
      required: true,
      options: [
        { value: 'employed', label: 'Employed' },
        { value: 'student', label: 'Student' },
      ],
    });

    expect(validator.safeParse('employed').success).toBe(true);
    expect(validator.safeParse('retired').success).toBe(false);
  });

  it('enforces required checkbox acceptance', () => {
    const validator = buildFieldValidator({
      type: 'checkbox',
      key: 'terms',
      label: 'Terms',
      required: true,
    });

    expect(validator.safeParse(true).success).toBe(true);
    expect(validator.safeParse(false).success).toBe(false);
  });

  it('supports optional fields', () => {
    const validator = buildFieldValidator({
      type: 'email',
      key: 'email',
      label: 'Email',
      required: false,
    });

    expect(validator.safeParse(undefined).success).toBe(true);
    expect(validator.safeParse('person@example.com').success).toBe(true);
  });

  it('validates number and currency min/max rules', () => {
    const numberValidator = buildFieldValidator({
      type: 'number',
      key: 'income',
      label: 'Income',
      required: true,
      min: 1000,
      max: 5000,
    });

    expect(numberValidator.safeParse(2500).success).toBe(true);
    expect(numberValidator.safeParse(500).success).toBe(false);

    const currencyValidator = buildFieldValidator({
      type: 'currency',
      key: 'loan.amount',
      label: 'Loan Amount',
      required: true,
      currency: 'GBP',
      min: 1000,
      max: 10000,
    });

    expect(currencyValidator.safeParse(5000).success).toBe(true);
    expect(currencyValidator.safeParse(12000).success).toBe(false);
  });

  it('validates multi-select limits', () => {
    const validator = buildFieldValidator({
      type: 'multi-select',
      key: 'needs',
      label: 'Needs',
      required: true,
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      minSelections: 1,
      maxSelections: 2,
    });

    expect(validator.safeParse(['a']).success).toBe(true);
    expect(validator.safeParse([]).success).toBe(false);
    expect(validator.safeParse(['a', 'b', 'c']).success).toBe(false);
  });

  it('validates date boundaries and invalid values', () => {
    const validator = buildFieldValidator({
      type: 'date',
      key: 'dob',
      label: 'DOB',
      required: true,
      minDate: '2000-01-01',
      maxDate: '2020-12-31',
    });

    expect(validator.safeParse('2010-06-01').success).toBe(true);
    expect(validator.safeParse('1999-12-31').success).toBe(false);
    expect(validator.safeParse('not-a-date').success).toBe(false);
  });

  it('validates file type and max size constraints', () => {
    const validator = buildFieldValidator({
      type: 'file',
      key: 'identity',
      label: 'Identity Document',
      required: true,
      accept: ['.pdf', 'image/*'],
      maxSizeMb: 1,
    });

    expect(
      validator.safeParse({ name: 'document.pdf', size: 1024, type: 'application/pdf' }).success,
    ).toBe(true);
    expect(
      validator.safeParse({ name: 'document.exe', size: 1024, type: 'application/octet-stream' })
        .success,
    ).toBe(false);
    expect(
      validator.safeParse({ name: 'large.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' })
        .success,
    ).toBe(false);
  });

  it('validates required address object fields', () => {
    const validator = buildFieldValidator({
      type: 'address',
      key: 'address.home',
      label: 'Home Address',
      required: true,
    });

    expect(
      validator.safeParse({
        line1: '10 Main Street',
        city: 'London',
        region: 'London',
        postcode: 'W1A 1AA',
        country: 'UK',
      }).success,
    ).toBe(true);

    expect(
      validator.safeParse({
        line1: '',
        city: 'London',
        region: 'London',
        postcode: 'W1A 1AA',
        country: 'UK',
      }).success,
    ).toBe(false);
  });

  it('validates phone and textarea paths', () => {
    const phoneValidator = buildFieldValidator({
      type: 'phone',
      key: 'phone',
      label: 'Phone',
      required: true,
    });

    expect(phoneValidator.safeParse('+44 7700 900123').success).toBe(true);
    expect(phoneValidator.safeParse('abc').success).toBe(false);

    const textAreaValidator = buildFieldValidator({
      type: 'textarea',
      key: 'notes',
      label: 'Notes',
      required: true,
      minLength: 5,
      maxLength: 10,
    });

    expect(textAreaValidator.safeParse('hello').success).toBe(true);
    expect(textAreaValidator.safeParse('no').success).toBe(false);
    expect(textAreaValidator.safeParse('this is too long').success).toBe(false);
  });

  it('builds step and form validators', () => {
    const stepValidator = buildStepValidator(baseSchema.steps[0]);
    expect(
      stepValidator.safeParse({
        'loan.amount': 5000,
        'loan.purpose': 'medical',
      }).success,
    ).toBe(true);

    const formValidator = buildFormValidator(baseSchema);
    expect(
      formValidator.safeParse({
        'loan.amount': 5000,
        'loan.purpose': 'medical',
        'employment.status': 'student',
        'employment.employerName': 'Acme Corp',
      }).success,
    ).toBe(true);
  });
});
