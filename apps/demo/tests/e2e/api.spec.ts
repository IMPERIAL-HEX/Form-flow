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
        formId: 'education-loan',
        source: 'demo',
        payload: {
          personal: {
            dateOfBirth: '1995-01-10',
          },
          documents: {
            identityDocument: 'passport.pdf',
            proofOfAddress: 'utility-bill.pdf',
          },
          employment: {
            status: 'student',
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = (await response.json()) as {
      success: boolean;
      id: string;
      kyc?: { decision: string; checks: Array<{ code: string; status: string }> };
    };
    expect(json.success).toBeTruthy();
    expect(typeof json.id).toBe('string');
    expect(json.kyc?.decision).toBe('approved');
    expect(
      json.kyc?.checks.some(
        (check) => check.code === 'identity-document' && check.status === 'pass',
      ),
    ).toBeTruthy();
  });

  test('runs direct KYC verification for eligible forms', async ({ request, baseURL }) => {
    const response = await request.post(`${baseURL}${routes.apiKycVerify}`, {
      data: {
        formId: 'education-loan',
        source: 'api',
        payload: {
          personal: {
            dateOfBirth: '2001-03-12',
          },
          documents: {
            identityDocument: 'national-id.png',
            proofOfAddress: 'bank-statement.pdf',
            incomeProof: 'payslip.pdf',
          },
          employment: {
            status: 'employed',
            monthlyIncome: 3000,
          },
          financial: {
            monthlyExpenses: 1800,
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = (await response.json()) as {
      success: boolean;
      verification: {
        decision: string;
        provider: string;
        checks: Array<{ code: string; status: string }>;
      };
    };

    expect(json.success).toBeTruthy();
    expect(json.verification.provider).toBe('mock-kyc-v1');
    expect(json.verification.decision).toBe('approved');
    expect(
      json.verification.checks.some(
        (check) => check.code === 'income-proof' && check.status === 'pass',
      ),
    ).toBeTruthy();
  });

  test('returns recent KYC verification events', async ({ request, baseURL }) => {
    await request.post(`${baseURL}${routes.apiKycVerify}`, {
      data: {
        formId: 'contact-form',
        source: 'api',
        payload: {
          'contact.name': 'Jordan Lee',
        },
      },
    });

    const response = await request.get(`${baseURL}${routes.apiKycEvents}?limit=5`);
    expect(response.ok()).toBeTruthy();

    const json = (await response.json()) as {
      events: Array<{ formId: string; decision: string; checks: Array<{ code: string }> }>;
    };

    expect(json.events.length).toBeGreaterThan(0);
    expect(json.events.some((event) => event.formId === 'contact-form')).toBeTruthy();
    expect(
      json.events.some(
        (event) =>
          event.decision === 'not-required' &&
          event.checks.some((check) => check.code === 'kyc-applicability'),
      ),
    ).toBeTruthy();
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
      kycSummary: {
        eligibleTotal: number;
        approvedRate: number;
        reviewRate: number;
        rejectedRate: number;
      };
      sources: Array<{ source: string; count: number }>;
      kycDecisions: Array<{ decision: string; count: number }>;
      forms: Array<{ formId: string; count: number }>;
      recentKycEvents: Array<{ decision: string; flaggedChecks: Array<{ code: string }> }>;
      recentSubmissions: Array<{ formId: string; source: string; kycDecision: string }>;
    };

    expect(json.totalSubmissions).toBeGreaterThanOrEqual(2);
    expect(json.sources.some((entry) => entry.source === 'demo' && entry.count >= 1)).toBeTruthy();
    expect(json.sources.some((entry) => entry.source === 'embed' && entry.count >= 1)).toBeTruthy();
    expect(
      json.forms.some((entry) => entry.formId === 'education-loan' && entry.count >= 2),
    ).toBeTruthy();
    expect(
      json.recentSubmissions.some(
        (entry) =>
          entry.formId === 'education-loan' &&
          (entry.source === 'demo' || entry.source === 'embed'),
      ),
    ).toBeTruthy();
    expect(json.kycDecisions.some((entry) => entry.count >= 1)).toBeTruthy();
    expect(json.recentKycEvents.length).toBeGreaterThanOrEqual(1);
    expect(
      json.recentKycEvents.some(
        (event) => event.decision === 'review' || event.flaggedChecks.length >= 0,
      ),
    ).toBeTruthy();
    expect(json.kycSummary.eligibleTotal).toBeGreaterThanOrEqual(0);
    expect(json.kycSummary.approvedRate).toBeGreaterThanOrEqual(0);
    expect(json.kycSummary.reviewRate).toBeGreaterThanOrEqual(0);
    expect(json.kycSummary.rejectedRate).toBeGreaterThanOrEqual(0);
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

    const kycFiltered = await request.get(
      `${baseURL}${routes.apiAnalyticsOverview}?kycDecision=not-required&window=24h`,
    );
    expect(kycFiltered.ok()).toBeTruthy();

    const kycJson = (await kycFiltered.json()) as {
      filters: { kycDecision: string };
      recentKycEvents: Array<{ decision: string }>;
      recentSubmissions: Array<{ kycDecision: string }>;
    };

    expect(kycJson.filters.kycDecision).toBe('not-required');
    expect(
      kycJson.recentSubmissions.every((entry) => entry.kycDecision === 'not-required'),
    ).toBeTruthy();
    expect(kycJson.recentKycEvents.every((event) => event.decision === 'not-required')).toBeTruthy();

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
