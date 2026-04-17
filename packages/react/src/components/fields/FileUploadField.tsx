import type { FileUploadFieldSchema, FileValue } from '@formflow/core';

import { FieldChrome } from './shared';
import type { FieldComponentProps } from './types';

export function FileUploadField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FieldComponentProps): React.ReactNode {
  const fileField = field as FileUploadFieldSchema;
  const files = normalizeFiles(value, fileField.multiple);

  const applyFileList = (fileList: FileList | null): void => {
    if (!fileList) {
      onChange(fileField.multiple ? [] : undefined);
      return;
    }

    const nextFiles = Array.from(fileList).map<FileValue>((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    onChange(fileField.multiple ? nextFiles : nextFiles[0]);
  };

  return (
    <FieldChrome field={field} error={error}>
      {() => (
        <div>
          <label
            style={{
              display: 'grid',
              placeItems: 'center',
              minHeight: '7rem',
              border: '1px dashed var(--ff-border)',
              borderRadius: 'var(--ff-radius)',
              background: 'var(--ff-bg-card)',
              cursor: 'pointer',
              padding: '0.75rem',
              marginBottom: '0.75rem',
            }}
            onDrop={(event) => {
              event.preventDefault();
              applyFileList(event.dataTransfer.files);
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            <input
              type="file"
              multiple={fileField.multiple}
              accept={fileField.accept?.join(',')}
              onBlur={onBlur}
              onChange={(event) => applyFileList(event.target.files)}
              style={{ display: 'none' }}
            />
            <span style={{ color: 'var(--ff-text-muted)' }}>
              Drop files here or click to browse
            </span>
          </label>

          {files.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`} style={{ marginBottom: '0.35rem' }}>
                  {file.name} ({formatBytes(file.size)})
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </FieldChrome>
  );
}

function normalizeFiles(value: unknown, multiple?: boolean): FileValue[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is FileValue => {
      if (!entry || typeof entry !== 'object') {
        return false;
      }

      const record = entry as Record<string, unknown>;
      return (
        typeof record.name === 'string' &&
        typeof record.size === 'number' &&
        typeof record.type === 'string'
      );
    });
  }

  if (!multiple && value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (
      typeof record.name === 'string' &&
      typeof record.size === 'number' &&
      typeof record.type === 'string'
    ) {
      return [{ name: record.name, size: record.size, type: record.type }];
    }
  }

  return [];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
