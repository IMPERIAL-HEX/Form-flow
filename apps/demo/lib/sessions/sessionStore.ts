import 'server-only';

import { randomBytes } from 'node:crypto';

const TOKEN_BYTES = 16;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_VALUES_BYTES = 64 * 1024;
const FORM_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

export interface SessionDraft {
  token: string;
  formId: string;
  stepId: string;
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface StoredDraft extends SessionDraft {
  expiresAt: number;
}

const drafts = new Map<string, StoredDraft>();

function purgeExpired(): void {
  const now = Date.now();
  for (const [token, draft] of drafts) {
    if (draft.expiresAt <= now) drafts.delete(token);
  }
}

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

function toPublic(draft: StoredDraft): SessionDraft {
  const { expiresAt: _expiresAt, ...publicFields } = draft;
  void _expiresAt;
  return publicFields;
}

export interface CreateSessionInput {
  formId: unknown;
  stepId: unknown;
  values: unknown;
}

export interface SessionValidationError {
  field: 'formId' | 'stepId' | 'values';
  message: string;
}

export function validateSessionInput(
  input: CreateSessionInput,
): { ok: true; data: Omit<SessionDraft, 'token' | 'createdAt' | 'updatedAt'> } | { ok: false; error: SessionValidationError } {
  if (typeof input.formId !== 'string' || !FORM_ID_PATTERN.test(input.formId)) {
    return { ok: false, error: { field: 'formId', message: 'formId must be a slug-safe string.' } };
  }
  if (typeof input.stepId !== 'string' || input.stepId.length === 0) {
    return { ok: false, error: { field: 'stepId', message: 'stepId is required.' } };
  }
  if (!input.values || typeof input.values !== 'object' || Array.isArray(input.values)) {
    return { ok: false, error: { field: 'values', message: 'values must be an object.' } };
  }
  const serialized = JSON.stringify(input.values);
  if (serialized.length > MAX_VALUES_BYTES) {
    return { ok: false, error: { field: 'values', message: 'values payload exceeds 64KB limit.' } };
  }
  return {
    ok: true,
    data: {
      formId: input.formId,
      stepId: input.stepId,
      values: input.values as Record<string, unknown>,
    },
  };
}

export function createSession(
  data: Omit<SessionDraft, 'token' | 'createdAt' | 'updatedAt'>,
): SessionDraft {
  purgeExpired();
  const now = new Date();
  const token = generateToken();
  const stored: StoredDraft = {
    token,
    formId: data.formId,
    stepId: data.stepId,
    values: data.values,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: now.getTime() + SESSION_TTL_MS,
  };
  drafts.set(token, stored);
  return toPublic(stored);
}

export function getSession(token: string): SessionDraft | null {
  purgeExpired();
  const stored = drafts.get(token);
  if (!stored) return null;
  return toPublic(stored);
}

export interface UpdateSessionInput {
  stepId: unknown;
  values: unknown;
}

export function updateSession(
  token: string,
  input: UpdateSessionInput,
): { ok: true; draft: SessionDraft } | { ok: false; reason: 'not-found' | 'invalid'; error?: SessionValidationError } {
  purgeExpired();
  const existing = drafts.get(token);
  if (!existing) return { ok: false, reason: 'not-found' };
  const validation = validateSessionInput({
    formId: existing.formId,
    stepId: input.stepId,
    values: input.values,
  });
  if (!validation.ok) return { ok: false, reason: 'invalid', error: validation.error };

  const updated: StoredDraft = {
    ...existing,
    stepId: validation.data.stepId,
    values: validation.data.values,
    updatedAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  drafts.set(token, updated);
  return { ok: true, draft: toPublic(updated) };
}

export function deleteSession(token: string): boolean {
  return drafts.delete(token);
}

export function resetSessionsForTesting(): void {
  drafts.clear();
}
