import React from "react";

function applyInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith("**")) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else {
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function PostRenderer({ body }: { body: string }) {
  const lines = body.split("\n");

  return (
    <div style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}>
      {lines.map((line, i) => {
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="my-6"
              style={{
                borderLeft: "3px solid var(--clay)",
                paddingLeft: "20px",
                fontStyle: "italic",
                opacity: 0.65,
                fontSize: "1.05rem",
                lineHeight: 1.75,
              }}
            >
              {applyInline(line.slice(2))}
            </blockquote>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-4" />;
        return (
          <p key={i} className="mb-5 text-base leading-relaxed" style={{ opacity: 0.7 }}>
            {applyInline(line)}
          </p>
        );
      })}
    </div>
  );
}
