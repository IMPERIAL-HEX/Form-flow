import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FormSchema } from '@formflow/core';

import { FormFlowRenderer } from '../src/components/renderer/FormFlowRenderer';

const schema: FormSchema = {
  id: 'test-form',
  version: '1.0.0',
  title: 'Test Form',
  layout: {
    template: 'centered',
    footer: {
      nextLabel: 'Next Step',
      submitLabel: 'Submit',
    },
  },
  submission: {
    endpoint: '/api/submissions',
    transformKeys: true,
  },
  steps: [
    {
      id: 'step-one',
      title: 'Step One',
      fields: [
        {
          type: 'text',
          key: 'applicant.firstName',
          label: 'First Name',
          required: true,
        },
      ],
    },
    {
      id: 'step-two',
      title: 'Step Two',
      fields: [
        {
          type: 'checkbox',
          key: 'termsAccepted',
          label: 'Accept terms',
          required: true,
        },
      ],
    },
  ],
};

describe('FormFlowRenderer', () => {
  it('navigates across steps and submits transformed payload', async () => {
    const onSubmit = vi.fn(async () => undefined);

    render(<FormFlowRenderer schema={schema} onSubmit={onSubmit} />);

    const firstName = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstName, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(screen.getByText('Step Two')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Accept terms'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      applicant: {
        firstName: 'Alice',
      },
      termsAccepted: true,
    });
  });
});
