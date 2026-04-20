import 'server-only';

import { schemaPresets } from '@/lib/schemas/presetSchemas';

const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const KNOWN_SOURCES = ['demo', 'embed', 'playground', 'api', 'unknown'] as const;

export type SubmissionSource = (typeof KNOWN_SOURCES)[number];

export interface SubmissionRecord {
  id: string;
  formId: string;
  source: SubmissionSource;
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

export interface AnalyticsOverview {
  generatedAt: string;
  totalSubmissions: number;
  lastSubmissionAt: string | null;
  sources: SourceMetric[];
  forms: FormMetric[];
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

export function recordSubmission(payload: unknown): SubmissionRecord {
  const { formId, source, data } = unwrapPayload(payload);

  const record: SubmissionRecord = {
    id: crypto.randomUUID(),
    formId,
    source,
    receivedAt: new Date().toISOString(),
    payloadFieldCount: countPayloadFields(data),
    payloadBytes: measurePayloadBytes(data),
  };

  const store = getStore();
  store.submissions.push(record);

  return record;
}

export function getAnalyticsOverview(): AnalyticsOverview {
  const store = getStore();
  const submissions = store.submissions;
  const knownForms = new Map(schemaPresets.map((preset) => [preset.id, preset.title]));

  const sourceCounts = new Map<SubmissionSource, number>(
    KNOWN_SOURCES.map((source) => [source, 0]),
  );
  const formCounts = new Map<string, number>();
  const formLastSeen = new Map<string, string>();

  for (const submission of submissions) {
    sourceCounts.set(submission.source, (sourceCounts.get(submission.source) ?? 0) + 1);
    formCounts.set(submission.formId, (formCounts.get(submission.formId) ?? 0) + 1);
    formLastSeen.set(submission.formId, submission.receivedAt);
  }

  const forms: FormMetric[] = [...knownForms.entries()].map(([formId, title]) => ({
    formId,
    title,
    count: formCounts.get(formId) ?? 0,
    lastSubmissionAt: formLastSeen.get(formId) ?? null,
  }));

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

  return {
    generatedAt: new Date().toISOString(),
    totalSubmissions: submissions.length,
    lastSubmissionAt: submissions.length > 0 ? submissions[submissions.length - 1]?.receivedAt ?? null : null,
    sources: KNOWN_SOURCES.map((source) => ({
      source,
      count: sourceCounts.get(source) ?? 0,
    })),
    forms,
    recentSubmissions,
  };
}
