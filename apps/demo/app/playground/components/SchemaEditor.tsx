interface SchemaEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
}

export function SchemaEditor({ value, onChange }: SchemaEditorProps): React.ReactNode {
  return (
    <label className="ff-editor-label">
      <span>Schema JSON</span>
      <textarea
        className="ff-editor"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
