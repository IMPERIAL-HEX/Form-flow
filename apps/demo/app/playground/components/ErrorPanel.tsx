interface ErrorPanelProps {
  error: string | null;
}

export function ErrorPanel({ error }: ErrorPanelProps): React.ReactNode {
  if (!error) {
    return (
      <div className="ff-schema-status ff-schema-valid" role="status">
        Schema is valid.
      </div>
    );
  }

  return (
    <div className="ff-schema-status ff-schema-error" role="alert">
      {error}
    </div>
  );
}
