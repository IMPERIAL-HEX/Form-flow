import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

const sampleDraft = {
  formId: 'education-loan',
  stepId: 'loan-details',
  values: { loanAmount: 5200, purpose: 'tuition' },
};

test.describe('session drafts api', () => {
  test('creates, reads, updates, and deletes a draft', async ({ request, baseURL }) => {
    const created = await request.post(`${baseURL}${routes.apiSessions}`, { data: sampleDraft });
    expect(created.status()).toBe(201);

    const createdJson = (await created.json()) as {
      success: boolean;
      draft: {
        token: string;
        formId: string;
        stepId: string;
        values: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
      };
    };
    expect(createdJson.success).toBeTruthy();
    expect(createdJson.draft.token).toMatch(/^[a-f0-9]{32}$/);
    expect(createdJson.draft.formId).toBe(sampleDraft.formId);

    const { token } = createdJson.draft;

    const fetched = await request.get(`${baseURL}${routes.apiSessions}/${token}`);
    expect(fetched.ok()).toBeTruthy();
    const fetchedJson = (await fetched.json()) as { draft: { values: Record<string, unknown> } };
    expect(fetchedJson.draft.values.loanAmount).toBe(5200);

    const updated = await request.put(`${baseURL}${routes.apiSessions}/${token}`, {
      data: { stepId: 'employment', values: { loanAmount: 6000, status: 'employed' } },
    });
    expect(updated.ok()).toBeTruthy();
    const updatedJson = (await updated.json()) as {
      draft: { stepId: string; values: Record<string, unknown> };
    };
    expect(updatedJson.draft.stepId).toBe('employment');
    expect(updatedJson.draft.values.status).toBe('employed');

    const deleted = await request.delete(`${baseURL}${routes.apiSessions}/${token}`);
    expect(deleted.ok()).toBeTruthy();

    const afterDelete = await request.get(`${baseURL}${routes.apiSessions}/${token}`);
    expect(afterDelete.status()).toBe(404);
  });

  test('rejects malformed token format on read', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiSessions}/not-a-real-token`);
    expect(response.status()).toBe(400);
  });

  test('rejects missing formId on create', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${routes.apiSessions}`, {
      data: { stepId: 'step-1', values: {} },
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { field?: string };
    expect(body.field).toBe('formId');
  });
});
