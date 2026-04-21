import 'server-only';

const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const DEFAULT_KYC_ELIGIBLE_FORMS = ['education-loan'] as const;
const INCOME_PROOF_REQUIRED_STATUSES = new Set(['employed', 'self-employed']);

export type KycDecision = 'approved' | 'review' | 'rejected' | 'not-required';
export type KycCheckStatus = 'pass' | 'review' | 'fail' | 'skip';
export type KycProviderId = 'mock-kyc-v1' | 'disabled';
export type KycProviderMode = 'enabled' | 'disabled';

export interface KycProviderConfig {
  provider: KycProviderId;
  mode: KycProviderMode;
  eligibleForms: string[];
}

export interface KycCheck {
  code: string;
  label: string;
  status: KycCheckStatus;
  reason?: string;
}

export interface KycVerificationResult {
  id: string;
  provider: KycProviderId;
  providerMode: KycProviderMode;
  formId: string;
  source: string;
  decision: KycDecision;
  confidence: number;
  checkedAt: string;
  checks: KycCheck[];
}

interface KycStore {
  events: KycVerificationResult[];
}

declare global {
  var __formflowKycStore: KycStore | undefined;
}

function getStore(): KycStore {
  if (!globalThis.__formflowKycStore) {
    globalThis.__formflowKycStore = {
      events: [],
    };
  }

  return globalThis.__formflowKycStore;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeFormId(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'unknown';
  }

  const formId = raw.trim();
  if (!FORM_ID_PATTERN.test(formId)) {
    return 'unknown';
  }

  return formId;
}

function normalizeSource(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'unknown';
  }

  const source = raw.trim();
  if (source.length === 0 || source.length > 32) {
    return 'unknown';
  }

  return source;
}

function resolveEligibleForms(raw: string | undefined): string[] {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return [...DEFAULT_KYC_ELIGIBLE_FORMS];
  }

  const parsed = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => FORM_ID_PATTERN.test(entry));

  if (parsed.length === 0) {
    return [...DEFAULT_KYC_ELIGIBLE_FORMS];
  }

  return [...new Set(parsed)];
}

function resolveKycProviderConfig(): KycProviderConfig {
  const providerValue = process.env.FORMFLOW_KYC_PROVIDER?.trim().toLowerCase();

  if (providerValue === 'disabled' || providerValue === 'off' || providerValue === 'none') {
    return {
      provider: 'disabled',
      mode: 'disabled',
      eligibleForms: [],
    };
  }

  return {
    provider: 'mock-kyc-v1',
    mode: 'enabled',
    eligibleForms: resolveEligibleForms(process.env.FORMFLOW_KYC_ELIGIBLE_FORMS),
  };
}

export function getKycProviderConfig(): KycProviderConfig {
  return resolveKycProviderConfig();
}

function unwrapPayload(payload: unknown): { formId: string; source: string; data: unknown } {
  if (!isRecord(payload)) {
    return {
      formId: 'unknown',
      source: 'unknown',
      data: payload,
    };
  }

  if (Object.hasOwn(payload, 'payload')) {
    return {
      formId: normalizeFormId(payload.formId),
      source: normalizeSource(payload.source),
      data: payload.payload,
    };
  }

  return {
    formId: normalizeFormId(payload.formId),
    source: normalizeSource(payload.source),
    data: payload,
  };
}

function getValueByPath(value: unknown, path: string): unknown {
  if (!isRecord(value)) {
    return undefined;
  }

  const parts = path.split('.');
  let current: unknown = value;

  for (const part of parts) {
    if (!isRecord(current) || !Object.hasOwn(current, part)) {
      return undefined;
    }

    current = current[part];
  }

  return current;
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }

  return value !== null && value !== undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function toAgeYears(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const dob = new Date(parsed);
  const now = new Date();

  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }

  return age;
}

function getDecisionFromChecks(checks: KycCheck[]): KycDecision {
  if (checks.some((check) => check.status === 'fail')) {
    return 'rejected';
  }

  if (checks.some((check) => check.status === 'review')) {
    return 'review';
  }

  return 'approved';
}

function getConfidence(decision: KycDecision): number {
  if (decision === 'approved') {
    return 92;
  }

  if (decision === 'review') {
    return 68;
  }

  if (decision === 'rejected') {
    return 30;
  }

  return 0;
}

function buildChecks(
  formId: string,
  data: unknown,
  eligibleForms: Set<string>,
): { decision: KycDecision; checks: KycCheck[] } {
  if (!eligibleForms.has(formId)) {
    const eligibleFormsReason =
      eligibleForms.size > 0
        ? `KYC rules are currently enabled for: ${[...eligibleForms].join(', ')}.`
        : 'No forms are currently configured for KYC checks.';

    return {
      decision: 'not-required',
      checks: [
        {
          code: 'kyc-applicability',
          label: 'KYC applicability',
          status: 'skip',
          reason: eligibleFormsReason,
        },
      ],
    };
  }

  const checks: KycCheck[] = [];

  const identityDocument = getValueByPath(data, 'documents.identityDocument');
  checks.push(
    hasValue(identityDocument)
      ? {
          code: 'identity-document',
          label: 'Identity document',
          status: 'pass',
        }
      : {
          code: 'identity-document',
          label: 'Identity document',
          status: 'fail',
          reason: 'Identity document is required for KYC approval.',
        },
  );

  const proofOfAddress = getValueByPath(data, 'documents.proofOfAddress');
  checks.push(
    hasValue(proofOfAddress)
      ? {
          code: 'proof-of-address',
          label: 'Proof of address',
          status: 'pass',
        }
      : {
          code: 'proof-of-address',
          label: 'Proof of address',
          status: 'review',
          reason: 'Proof of address is missing and requires manual follow-up.',
        },
  );

  const age = toAgeYears(getValueByPath(data, 'personal.dateOfBirth'));
  if (age === null) {
    checks.push({
      code: 'age-threshold',
      label: 'Age threshold',
      status: 'review',
      reason: 'Date of birth was not provided in a valid format.',
    });
  } else if (age < 18) {
    checks.push({
      code: 'age-threshold',
      label: 'Age threshold',
      status: 'fail',
      reason: 'Applicant must be at least 18 years old.',
    });
  } else {
    checks.push({
      code: 'age-threshold',
      label: 'Age threshold',
      status: 'pass',
    });
  }

  const employmentStatus = getValueByPath(data, 'employment.status');
  if (
    typeof employmentStatus === 'string' &&
    INCOME_PROOF_REQUIRED_STATUSES.has(employmentStatus)
  ) {
    const incomeProof = getValueByPath(data, 'documents.incomeProof');
    checks.push(
      hasValue(incomeProof)
        ? {
            code: 'income-proof',
            label: 'Income proof',
            status: 'pass',
          }
        : {
            code: 'income-proof',
            label: 'Income proof',
            status: 'fail',
            reason: 'Income proof is required for employed applicants.',
          },
    );
  } else {
    checks.push({
      code: 'income-proof',
      label: 'Income proof',
      status: 'skip',
      reason: 'Income proof is optional for the selected employment status.',
    });
  }

  const monthlyIncome = toNumber(getValueByPath(data, 'employment.monthlyIncome'));
  const monthlyExpenses = toNumber(getValueByPath(data, 'financial.monthlyExpenses'));

  if (monthlyIncome !== null && monthlyExpenses !== null) {
    checks.push(
      monthlyIncome >= monthlyExpenses
        ? {
            code: 'affordability-baseline',
            label: 'Affordability baseline',
            status: 'pass',
          }
        : {
            code: 'affordability-baseline',
            label: 'Affordability baseline',
            status: 'review',
            reason: 'Monthly income is lower than declared expenses.',
          },
    );
  } else {
    checks.push({
      code: 'affordability-baseline',
      label: 'Affordability baseline',
      status: 'skip',
      reason: 'Income or expense data is not available for automated checks.',
    });
  }

  return {
    decision: getDecisionFromChecks(checks),
    checks,
  };
}

export function verifySubmissionKyc(payload: unknown): KycVerificationResult {
  const { formId, source, data } = unwrapPayload(payload);
  const providerConfig = resolveKycProviderConfig();

  let decision: KycDecision;
  let checks: KycCheck[];

  if (providerConfig.mode === 'disabled') {
    decision = 'not-required';
    checks = [
      {
        code: 'kyc-provider',
        label: 'KYC provider',
        status: 'skip',
        reason: 'KYC provider is disabled by FORMFLOW_KYC_PROVIDER.',
      },
    ];
  } else {
    const resolved = buildChecks(formId, data, new Set(providerConfig.eligibleForms));
    decision = resolved.decision;
    checks = resolved.checks;
  }

  const result: KycVerificationResult = {
    id: crypto.randomUUID(),
    provider: providerConfig.provider,
    providerMode: providerConfig.mode,
    formId,
    source,
    decision,
    confidence: getConfidence(decision),
    checkedAt: new Date().toISOString(),
    checks,
  };

  const store = getStore();
  store.events.push(result);

  return result;
}

export function getKycEvents(limit = 25): KycVerificationResult[] {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const store = getStore();

  return [...store.events].slice(-safeLimit).reverse();
}
