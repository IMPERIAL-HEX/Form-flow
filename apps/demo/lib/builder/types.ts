export type BuilderSelection =
  | { kind: 'none' }
  | { kind: 'step'; stepId: string }
  | { kind: 'field'; stepId: string; fieldKey: string };

export function isSameSelection(a: BuilderSelection, b: BuilderSelection): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'step' && b.kind === 'step') return a.stepId === b.stepId;
  if (a.kind === 'field' && b.kind === 'field')
    return a.stepId === b.stepId && a.fieldKey === b.fieldKey;
  return a.kind === 'none' && b.kind === 'none';
}
