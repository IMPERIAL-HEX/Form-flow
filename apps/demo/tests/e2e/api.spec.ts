import { expect, test } from '@playwright/test';

import { routes } from './fixtures/routes';

test.describe('api routes', () => {
  test('returns education-loan schema', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiFormEducationLoan}`);

    expect(response.ok()).toBeTruthy();

    const json = (await response.json()) as { id: string; steps: unknown[] };
    expect(json.id).toBe('education-loan');
    expect(Array.isArray(json.steps)).toBeTruthy();
  });

  test('returns not found for unknown schema', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}${routes.apiFormMissing}`);

    expect(response.status()).toBe(404);
  });

  test('accepts submission payload', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        sample: true,
        source: 'e2e',
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = (await response.json()) as { success: boolean; id: string };
    expect(json.success).toBeTruthy();
    expect(typeof json.id).toBe('string');
  });

  test('returns analytics overview with submission counts', async ({ request, baseURL }) => {
    await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        formId: 'education-loan',
        source: 'demo',
        payload: {
          loanAmount: 5000,
          firstName: 'Alex',
        },
      },
    });

    await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        formId: 'education-loan',
        source: 'embed',
        payload: {
          loanAmount: 8000,
        },
      },
    });

    const response = await request.get(`${baseURL}${routes.apiAnalyticsOverview}`);
    expect(response.ok()).toBeTruthy();

    const json = (await response.json()) as {
      totalSubmissions: number;
      sources: Array<{ source: string; count: number }>;
      forms: Array<{ formId: string; count: number }>;
      recentSubmissions: Array<{ formId: string; source: string }>;
    };

    expect(json.totalSubmissions).toBeGreaterThanOrEqual(2);
    expect(
      json.sources.some((entry) => entry.source === 'demo' && entry.count >= 1),
    ).toBeTruthy();
    expect(
      json.sources.some((entry) => entry.source === 'embed' && entry.count >= 1),
    ).toBeTruthy();
    expect(
      json.forms.some((entry) => entry.formId === 'education-loan' && entry.count >= 2),
    ).toBeTruthy();
    expect(
      json.recentSubmissions.some(
        (entry) => entry.formId === 'education-loan' && (entry.source === 'demo' || entry.source === 'embed'),
      ),
    ).toBeTruthy();
  });

  test('supports analytics filters through query parameters', async ({ request, baseURL }) => {
    const uniqueFormId = `e2e-filter-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    await request.post(`${baseURL}${routes.apiSubmissions}`, {
      data: {
        formId: uniqueFormId,
        source: 'demo',
        payload: {
          sample: true,
          loanAmount: 6200,
        },
      },
    });

    const sourceFiltered = await request.get(
      `${baseURL}${routes.apiAnalyticsOverview}?source=demo&window=24h`,
    );
    expect(sourceFiltered.ok()).toBeTruthy();

    const sourceJson = (await sourceFiltered.json()) as {
      filters: { source: string; window: string };
      recentSubmissions: Array<{ source: string }>;
    };

    expect(sourceJson.filters.source).toBe('demo');
    expect(sourceJson.filters.window).toBe('24h');
    expect(sourceJson.recentSubmissions.every((entry) => entry.source === 'demo')).toBeTruthy();

    const formFiltered = await request.get(
      `${baseURL}${routes.apiAnalyticsOverview}?formId=${uniqueFormId}&window=24h`,
    );
    expect(formFiltered.ok()).toBeTruthy();

    const formJson = (await formFiltered.json()) as {
      filters: { formId: string };
      totalSubmissions: number;
      recentSubmissions: Array<{ formId: string }>;
    };

    expect(formJson.filters.formId).toBe(uniqueFormId);
    expect(formJson.totalSubmissions).toBeGreaterThanOrEqual(1);
    expect(formJson.recentSubmissions.every((entry) => entry.formId === uniqueFormId)).toBeTruthy();
  });
});
