"use client";

// Portfolio skin over better-content (see README → "Content Engine").
import React from "react";
import { ContentEditSpan as HeadlessContentEditSpan } from "better-content/react";
import { cn } from "@/lib/utils";

type AsTag = "span" | "h1" | "h2" | "h3" | "p" | "div";

interface ContentSpanProps {
  collection?: string;
  /** Id of the item this field belongs to (a singleton "section" has a stable id). */
  itemId: string;
  fieldKey: string;
  className?: string;
  children: React.ReactNode;
  as?: AsTag;
}

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  primary?: boolean;
  underline?: boolean;
  break?: boolean;
  link?: string;
};

const PATTERNS = [
  { regex: /^\*\*(.+?)\*\*/, mark: "bold" },
  { regex: /^\*(.+?)\*/, mark: "italic" },
  { regex: /^~~br~~/, mark: "break" },
  { regex: /^~~(.+?)~~/, mark: "strike" },
  { regex: /^\^\^(.+?)\^\^/, mark: "primary" },
  { regex: /^__(.+?)__/, mark: "underline" },
  {
    regex: /^\[(.+?)\]\((https?:\/\/[^\s)]+)\)/,
    mark: "link",
    isLink: true,
  },
] as const;

function parseSpecialString(input: string): CustomText[] {
  const out: CustomText[] = [];
  let text = input;

  while (text.length) {
    let matched = false;

    for (const p of PATTERNS) {
      const m = p.regex.exec(text);
      if (!m) continue;

      matched = true;

      if (p.mark === "break") {
        out.push({ text: "\n", break: true });
      } else if ("isLink" in p) {
        out.push({ text: m[1], link: m[2] });
      } else {
        const inner = parseSpecialString(m[1]);
        inner.forEach(
          (n) => ((n as unknown as Record<string, boolean>)[p.mark] = true),
        );
        out.push(...inner);
      }

      text = text.slice(m[0].length);
      break;
    }

    if (!matched) {
      out.push({ text: text[0] });
      text = text.slice(1);
    }
  }

  return out;
}

/** Render the portfolio's micro-syntax into inline nodes. */
function renderMarkup(raw: string): React.ReactNode {
  const nodes = parseSpecialString(raw);
  return (
    <>
      {nodes.map((l, i) => {
        if (l.break) return <br key={i} />;
        let el: React.ReactNode = l.text;

        if (l.bold) el = <strong>{el}</strong>;
        if (l.italic) el = <em>{el}</em>;
        if (l.strike) el = <s>{el}</s>;

        if (l.primary || l.underline) {
          el = (
            <span
              style={{
                color: l.primary ? "var(--color-primary)" : undefined,
                textDecoration: l.underline ? "underline" : undefined,
              }}
            >
              {el}
            </span>
          );
        }

        if (l.link) {
          el = (
            <a
              href={l.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline hover:underline"
            >
              {el}
            </a>
          );
        }

        return <span key={i}>{el}</span>;
      })}
    </>
  );
}

export default function ContentEditSpan({
  collection = "portfolio",
  itemId,
  fieldKey,
  className,
  children,
  as = "span",
}: ContentSpanProps) {
  return (
    <HeadlessContentEditSpan
      collection={collection}
      itemId={itemId}
      fieldKey={fieldKey}
      as={as}
      renderValue={renderMarkup}
      className={cn(
        className,
        "outline-none transition-all duration-200",
        "whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
        "data-[cms-editing]:cursor-text",
        "data-[cms-editing]:hover:ring-1 data-[cms-editing]:hover:ring-primary/30 data-[cms-editing]:hover:ring-offset-1 data-[cms-editing]:hover:ring-offset-neutral-900 data-[cms-editing]:hover:rounded-sm data-[cms-editing]:hover:px-2",
        "data-[cms-focused]:ring-2 data-[cms-focused]:ring-primary/50 data-[cms-focused]:ring-offset-2 data-[cms-focused]:ring-offset-neutral-900 data-[cms-focused]:rounded-sm data-[cms-focused]:px-2",
      )}
    >
      {children}
    </HeadlessContentEditSpan>
  );
}
