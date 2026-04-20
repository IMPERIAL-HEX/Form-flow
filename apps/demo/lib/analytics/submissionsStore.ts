import 'server-only';

import { schemaPresets } from '@/lib/schemas/presetSchemas';
import type { KycDecision } from '@/lib/kyc/verificationService';

const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const KNOWN_SOURCES = ['demo', 'embed', 'playground', 'api', 'unknown'] as const;
const ANALYTICS_WINDOWS = ['24h', '7d', '30d', 'all'] as const;
const KNOWN_KYC_DECISIONS = ['approved', 'review', 'rejected', 'not-required', 'unknown'] as const;

export type SubmissionSource = (typeof KNOWN_SOURCES)[number];
export type AnalyticsWindow = (typeof ANALYTICS_WINDOWS)[number];
export type AnalyticsSourceFilter = SubmissionSource | 'all';
export type SubmissionKycDecision = (typeof KNOWN_KYC_DECISIONS)[number];
export type AnalyticsKycDecisionFilter = KycDecision | 'all';

export interface SubmissionRecord {
  id: string;
  formId: string;
  source: SubmissionSource;
  kycDecision: SubmissionKycDecision;
  receivedAt: string;
  payloadFieldCount: number;
  payloadBytes: number;
}

export interface SourceMetric {
  source: SubmissionSource;
  count: number;
}

export interface FormMetric {
  formId: string;
  title: string;
  count: number;
  lastSubmissionAt: string | null;
}

export interface KycDecisionMetric {
  decision: SubmissionKycDecision;
  count: number;
}

export interface AnalyticsFilters {
  formId: string;
  source: AnalyticsSourceFilter;
  window: AnalyticsWindow;
  kycDecision: AnalyticsKycDecisionFilter;
}

interface AnalyticsFilterInput {
  formId?: unknown;
  source?: unknown;
  window?: unknown;
  kycDecision?: unknown;
}

export interface FormCatalogItem {
  formId: string;
  title: string;
}

export interface AnalyticsOverview {
  generatedAt: string;
  filters: AnalyticsFilters;
  totalSubmissions: number;
  lastSubmissionAt: string | null;
  maxSourceCount: number;
  maxFormCount: number;
  maxKycDecisionCount: number;
  formCatalog: FormCatalogItem[];
  sources: SourceMetric[];
  forms: FormMetric[];
  kycDecisions: KycDecisionMetric[];
  recentSubmissions: SubmissionRecord[];
}

interface SubmissionStoreState {
  submissions: SubmissionRecord[];
}

declare global {
  var __formflowSubmissionStore: SubmissionStoreState | undefined;
}

function getStore(): SubmissionStoreState {
  if (!globalThis.__formflowSubmissionStore) {
    globalThis.__formflowSubmissionStore = {
      submissions: [],
    };
  }

  return globalThis.__formflowSubmissionStore;
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

function normalizeSource(raw: unknown): SubmissionSource {
  if (typeof raw !== 'string') {
    return 'unknown';
  }

  if (KNOWN_SOURCES.includes(raw as SubmissionSource)) {
    return raw as SubmissionSource;
  }

  return 'unknown';
}

function normalizeKycDecision(raw: unknown): SubmissionKycDecision {
  if (typeof raw !== 'string') {
    return 'unknown';
  }

  const decision = raw.trim();
  if (KNOWN_KYC_DECISIONS.includes(decision as SubmissionKycDecision)) {
    return decision as SubmissionKycDecision;
  }

  return 'unknown';
}

function normalizeSourceFilter(raw: unknown): AnalyticsSourceFilter {
  if (typeof raw !== 'string') {
    return 'all';
  }

  const source = raw.trim();
  if (source === 'all') {
    return 'all';
  }

  if (KNOWN_SOURCES.includes(source as SubmissionSource)) {
    return source as SubmissionSource;
  }

  return 'all';
}

function normalizeWindow(raw: unknown): AnalyticsWindow {
  if (typeof raw !== 'string') {
    return 'all';
  }

  const window = raw.trim();
  if (ANALYTICS_WINDOWS.includes(window as AnalyticsWindow)) {
    return window as AnalyticsWindow;
  }

  return 'all';
}

function normalizeKycDecisionFilter(raw: unknown): AnalyticsKycDecisionFilter {
  if (typeof raw !== 'string') {
    return 'all';
  }

  const decision = raw.trim();
  if (decision === 'all') {
    return 'all';
  }

  if (decision === 'approved' || decision === 'review' || decision === 'rejected' || decision === 'not-required') {
    return decision;
  }

  return 'all';
}

function normalizeFormFilter(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'all';
  }

  const formId = raw.trim();
  if (formId === 'all') {
    return 'all';
  }

  if (!FORM_ID_PATTERN.test(formId)) {
    return 'all';
  }

  return formId;
}

function resolveFilters(filters?: AnalyticsFilterInput): AnalyticsFilters {
  return {
    formId: normalizeFormFilter(filters?.formId),
    source: normalizeSourceFilter(filters?.source),
    window: normalizeWindow(filters?.window),
    kycDecision: normalizeKycDecisionFilter(filters?.kycDecision),
  };
}

function getWindowCutoff(window: AnalyticsWindow): number | null {
  const now = Date.now();

  if (window === '24h') {
    return now - 24 * 60 * 60 * 1000;
  }

  if (window === '7d') {
    return now - 7 * 24 * 60 * 60 * 1000;
  }

  if (window === '30d') {
    return now - 30 * 24 * 60 * 60 * 1000;
  }

  return null;
}

function applySubmissionFilters(
  submissions: SubmissionRecord[],
  filters: AnalyticsFilters,
): SubmissionRecord[] {
  const cutoff = getWindowCutoff(filters.window);

  return submissions.filter((submission) => {
    if (filters.formId !== 'all' && submission.formId !== filters.formId) {
      return false;
    }

    if (filters.source !== 'all' && submission.source !== filters.source) {
      return false;
    }

    if (filters.kycDecision !== 'all' && submission.kycDecision !== filters.kycDecision) {
      return false;
    }

    if (cutoff !== null) {
      const receivedAt = new Date(submission.receivedAt).getTime();
      if (!Number.isFinite(receivedAt) || receivedAt < cutoff) {
        return false;
      }
    }

    return true;
  });
}

function unwrapPayload(payload: unknown): {
  formId: string;
  source: SubmissionSource;
  data: unknown;
} {
  if (!isRecord(payload)) {
    return {
      formId: 'unknown',
      source: 'unknown',
      data: payload,
    };
  }

  const hasWrappedPayload = Object.hasOwn(payload, 'payload');
  if (hasWrappedPayload) {
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

interface RecordSubmissionOptions {
  kycDecision?: unknown;
}

function countPayloadFields(data: unknown): number {
  if (!isRecord(data)) {
    return 0;
  }

  return Object.keys(data).length;
}

function measurePayloadBytes(data: unknown): number {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

export function recordSubmission(payload: unknown, options?: RecordSubmissionOptions): SubmissionRecord {
  const { formId, source, data } = unwrapPayload(payload);

  const record: SubmissionRecord = {
    id: crypto.randomUUID(),
    formId,
    source,
    kycDecision: normalizeKycDecision(options?.kycDecision),
    receivedAt: new Date().toISOString(),
    payloadFieldCount: countPayloadFields(data),
    payloadBytes: measurePayloadBytes(data),
  };

  const store = getStore();
  store.submissions.push(record);

  return record;
}

export function getAnalyticsOverview(filters?: AnalyticsFilterInput): AnalyticsOverview {
  const store = getStore();
  const allSubmissions = store.submissions;
  const resolvedFilters = resolveFilters(filters);
  const submissions = applySubmissionFilters(allSubmissions, resolvedFilters);
  const knownForms = new Map(schemaPresets.map((preset) => [preset.id, preset.title]));

  const sourceCounts = new Map<SubmissionSource, number>(
    KNOWN_SOURCES.map((source) => [source, 0]),
  );
  const kycDecisionCounts = new Map<SubmissionKycDecision, number>(
    KNOWN_KYC_DECISIONS.map((decision) => [decision, 0]),
  );
  const formCounts = new Map<string, number>();
  const formLastSeen = new Map<string, string>();

  for (const submission of submissions) {
    sourceCounts.set(submission.source, (sourceCounts.get(submission.source) ?? 0) + 1);
    kycDecisionCounts.set(
      submission.kycDecision,
      (kycDecisionCounts.get(submission.kycDecision) ?? 0) + 1,
    );
    formCounts.set(submission.formId, (formCounts.get(submission.formId) ?? 0) + 1);
    formLastSeen.set(submission.formId, submission.receivedAt);
  }

  const formCatalogMap = new Map<string, string>(knownForms);
  for (const submission of allSubmissions) {
    if (!formCatalogMap.has(submission.formId)) {
      formCatalogMap.set(
        submission.formId,
        submission.formId === 'unknown' ? 'Unknown form' : 'Custom form',
      );
    }
  }

  const formCatalog: FormCatalogItem[] = [...formCatalogMap.entries()]
    .map(([formId, title]) => ({ formId, title }))
    .sort((left, right) => left.formId.localeCompare(right.formId));

  const includeZeroCountKnownForms = resolvedFilters.formId === 'all';

  const forms: FormMetric[] = [...knownForms.entries()]
    .map(([formId, title]) => ({
      formId,
      title,
      count: formCounts.get(formId) ?? 0,
      lastSubmissionAt: formLastSeen.get(formId) ?? null,
    }))
    .filter((entry) => includeZeroCountKnownForms || entry.count > 0);

  for (const [formId, count] of formCounts.entries()) {
    if (knownForms.has(formId)) {
      continue;
    }

    forms.push({
      formId,
      title: formId === 'unknown' ? 'Unknown form' : 'Custom form',
      count,
      lastSubmissionAt: formLastSeen.get(formId) ?? null,
    });
  }

  forms.sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.formId.localeCompare(right.formId);
  });

  const recentSubmissions = [...submissions].slice(-10).reverse();
  const maxSourceCount = Math.max(
    1,
    ...KNOWN_SOURCES.map((source) => sourceCounts.get(source) ?? 0),
  );
  const maxFormCount = Math.max(1, ...forms.map((form) => form.count));
  const maxKycDecisionCount = Math.max(
    1,
    ...KNOWN_KYC_DECISIONS.map((decision) => kycDecisionCounts.get(decision) ?? 0),
  );

  return {
    generatedAt: new Date().toISOString(),
    filters: resolvedFilters,
    totalSubmissions: submissions.length,
    lastSubmissionAt:
      submissions.length > 0 ? (submissions[submissions.length - 1]?.receivedAt ?? null) : null,
    maxSourceCount,
    maxFormCount,
    maxKycDecisionCount,
    formCatalog,
    sources: KNOWN_SOURCES.map((source) => ({
      source,
      count: sourceCounts.get(source) ?? 0,
    })),
    forms,
    kycDecisions: KNOWN_KYC_DECISIONS.map((decision) => ({
      decision,
      count: kycDecisionCounts.get(decision) ?? 0,
    })),
    recentSubmissions,
  };
}
