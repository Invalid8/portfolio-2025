"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";
import { cn } from "@/lib/utils";

interface ContentSpanProps {
  collection?: string;
  sectionKey: string;
  fieldKey: string;
  className?: string;
  children: React.ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
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

function RenderStatic({
  raw,
  as: Component = "span",
  className,
}: {
  raw: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
}) {
  const nodes = parseSpecialString(raw);

  const content = (
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

  return <Component className={className}>{content}</Component>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current?.[key] === undefined) return undefined;
    current = current[key];
  }

  return current;
}

export default function ContentSpan({
  collection = "portfolio",
  sectionKey,
  fieldKey,
  className,
  children,
  as = "span",
}: ContentSpanProps) {
  const { sections, editField } = usePageContext();
  const { isEditing } = useAuth();

  const section = sections[collection]?.[sectionKey];
  const raw =
    getNestedValue(section, fieldKey) ??
    (typeof children === "string" ? children : "");

  if (!isEditing) {
    return <RenderStatic raw={raw} as={as} className={className} />;
  }

  return (
    <EditableContentSpan
      collection={collection}
      sectionKey={sectionKey}
      fieldKey={fieldKey}
      className={className}
      raw={raw}
      editField={editField}
      as={as}
    />
  );
}

function EditableContentSpan({
  collection = "portfolio",
  sectionKey,
  fieldKey,
  className,
  raw,
  editField,
  as: Component = "span",
}: {
  collection?: string;
  sectionKey: string;
  fieldKey: string;
  className?: string;
  raw: string;
  editField: (
    collection: string,
    sectionKey: string,
    fieldKey: string,
    value: string,
  ) => void;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const { isEditing } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [editValue, setEditValue] = useState(raw);
  const contentRef = useRef<HTMLElement>(null);
  const rawRef = useRef(raw);

  useEffect(() => {
    if (!isFocused && rawRef.current !== raw) {
      rawRef.current = raw;
    }
  }, [raw, isFocused]);

  useEffect(() => {
    if (!isFocused && rawRef.current !== editValue) {
      setEditValue(rawRef.current);
    }
  }, [isFocused, editValue]);

  const handleInput = useCallback(() => {
    if (contentRef.current) {
      setEditValue(contentRef.current.textContent || "");
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (editValue !== raw) {
      editField(collection!, sectionKey, fieldKey, editValue);
    }
  }, [editValue, raw, collection, sectionKey, fieldKey, editField]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (contentRef.current) {
      contentRef.current.textContent = editValue;
      setTimeout(() => {
        if (contentRef.current) {
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(contentRef.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    }
  }, [editValue]);

  return (
    <Component
      key={isFocused ? "editing" : "static"}
      ref={
        contentRef as React.RefObject<
          HTMLElement &
            HTMLSpanElement &
            HTMLHeadingElement &
            HTMLParagraphElement &
            HTMLDivElement
        >
      }
      className={cn(
        className,
        "outline-none transition-all duration-200",
        "whitespace-pre-wrap break-words overflow-wrap-anywhere",
        isFocused &&
          "ring-2 ring-primary/50 ring-offset-2 ring-offset-neutral-900 rounded-sm px-2",
        !isFocused &&
          isEditing &&
          "hover:ring-1 hover:ring-primary/30 hover:ring-offset-1 hover:ring-offset-neutral-900 hover:rounded-sm hover:px-2 cursor-text",
      )}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      {!isFocused && <RenderStatic raw={editValue} as="span" />}
    </Component>
  );
}
