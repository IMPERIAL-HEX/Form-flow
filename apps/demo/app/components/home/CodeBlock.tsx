interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'json' }: CodeBlockProps): React.ReactNode {
  return (
    <pre className="ff-code-block" data-language={language}>
      <code>{code}</code>
    </pre>
  );
}
