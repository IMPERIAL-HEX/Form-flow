import type { FormSchema } from '@formflow/core';

import contactForm from '@/schemas/contact-form.json';
import educationLoan from '@/schemas/education-loan.json';
import feedbackSurvey from '@/schemas/feedback-survey.json';

export interface SchemaPreset {
  id: string;
  title: string;
  description: string;
  schema: FormSchema;
}

export const schemaPresets: SchemaPreset[] = [
  {
    id: 'education-loan',
    title: 'Education Loan',
    description: '10-step lending flow with conditional sections and document upload.',
    schema: educationLoan as FormSchema,
  },
  {
    id: 'contact-form',
    title: 'Contact Intake',
    description: 'Simple two-step intake form for support and product enquiries.',
    schema: contactForm as FormSchema,
  },
  {
    id: 'feedback-survey',
    title: 'Feedback Survey',
    description: 'Three-step post-service survey with segmented follow-up questions.',
    schema: feedbackSurvey as FormSchema,
  },
];

export function getPresetById(id: string): SchemaPreset {
  const fallback = schemaPresets[0];

  if (!fallback) {
    throw new Error('No schema presets configured.');
  }

  return schemaPresets.find((preset) => preset.id === id) ?? fallback;
}
