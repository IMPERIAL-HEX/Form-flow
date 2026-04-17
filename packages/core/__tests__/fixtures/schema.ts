import type { FormSchema } from '../../src/schema/types';

export const baseSchema: FormSchema = {
  id: 'education-loan',
  version: '1.0.0',
  title: 'Education Loan',
  layout: {
    template: 'sidebar-left',
  },
  submission: {
    endpoint: '/api/submissions',
    method: 'POST',
    transformKeys: true,
  },
  steps: [
    {
      id: 'amount',
      title: 'Loan Amount',
      fields: [
        {
          type: 'currency',
          key: 'loan.amount',
          label: 'Amount',
          min: 1000,
          max: 10000,
          currency: 'GBP',
          required: true,
          quickSelect: [1000, 5000, 10000],
        },
        {
          type: 'select',
          key: 'loan.purpose',
          label: 'Purpose',
          required: true,
          options: [
            { value: 'medical', label: 'Medical' },
            { value: 'dental', label: 'Dental' },
          ],
        },
      ],
    },
    {
      id: 'employment-status',
      title: 'Employment Status',
      fields: [
        {
          type: 'select',
          key: 'employment.status',
          label: 'Employment Status',
          required: true,
          options: [
            { value: 'employed', label: 'Employed' },
            { value: 'student', label: 'Student' },
          ],
        },
      ],
    },
    {
      id: 'employment-details',
      title: 'Employment Details',
      showIf: {
        field: 'employment.status',
        operator: 'eq',
        value: 'employed',
      },
      fields: [
        {
          type: 'text',
          key: 'employment.employerName',
          label: 'Employer Name',
          required: true,
        },
      ],
    },
  ],
};
