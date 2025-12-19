"use client";

import React, { useMemo, useCallback } from "react";
import {
  createEditor,
  BaseEditor,
  Descendant,
  Text,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderLeafProps,
} from "slate-react";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";

interface ContentSpanProps {
  sectionKey: string;
  fieldKey: string;
  className?: string;
  children: React.ReactNode;
}

interface ParagraphElement extends SlateElement {
  type: "paragraph";
  children: Text[];
}

type CustomText = Text & {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  primary?: boolean;
  underline?: boolean;
  break?: boolean;
  link?: string;
};

function parseSpecialString(rawText: string): CustomText[] {
  const result: CustomText[] = [];
  let remaining = rawText;

  const patterns: {
    regex: RegExp;
    mark: keyof CustomText;
    isLink?: boolean;
  }[] = [
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
  ];

  while (remaining.length) {
    let matched = false;

    for (const p of patterns) {
      const match = p.regex.exec(remaining);
      if (match) {
        matched = true;

        if (p.isLink) {
          result.push({ text: match[1], link: match[2] });
        } else if (p.mark === "break") {
          result.push({ text: "", break: true });
        } else {
          const children = parseSpecialString(match[1]);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children.forEach((c: any) => (c[p.mark] = true));
          result.push(...children);
        }

        remaining = remaining.slice(match[0].length);
        break;
      }
    }

    if (!matched) {
      result.push({ text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return result;
}

function createInitialValue(rawText: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: parseSpecialString(rawText),
    } as ParagraphElement,
  ];
}

const renderLeaf = (props: RenderLeafProps) => {
  let { children } = props;
  const leaf = props.leaf as CustomText;

  if (leaf.break) return <br {...props.attributes} />;

  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.strike) children = <s>{children}</s>;

  if (leaf.primary || leaf.underline) {
    children = (
      <span
        className={leaf.primary ? "text-primary" : undefined}
        style={leaf.underline ? { textDecoration: "underline" } : undefined}
      >
        {children}
      </span>
    );
  }

  if (leaf.link) {
    children = (
      <a href={leaf.link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <span {...props.attributes}>{children}</span>;
};

function RenderStatic({ raw }: { raw: string }) {
  const nodes = parseSpecialString(raw);

  return (
    <>
      {nodes.map((leaf, i) => {
        if (leaf.break) return <br key={i} />;

        const parts = leaf.text.split("\n");

        return (
          <React.Fragment key={i}>
            {parts.map((part, j) => {
              let el: React.ReactNode = part;

              if (leaf.bold) el = <strong>{el}</strong>;
              if (leaf.italic) el = <em>{el}</em>;
              if (leaf.strike) el = <s>{el}</s>;

              if (leaf.primary || leaf.underline) {
                el = (
                  <span
                    className={leaf.primary ? "text-primary" : undefined}
                    style={
                      leaf.underline
                        ? { textDecoration: "underline" }
                        : undefined
                    }
                  >
                    {el}
                  </span>
                );
              }

              if (leaf.link) {
                el = (
                  <a href={leaf.link} target="_blank" rel="noopener noreferrer">
                    {el}
                  </a>
                );
              }

              return (
                <React.Fragment key={j}>
                  {el}
                  {j < parts.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default function ContentSpan({
  sectionKey,
  fieldKey,
  className,
  children,
}: ContentSpanProps) {
  const { sections, editField, saveSection } = usePageContext();
  const { isEditing } = useAuth();

  const savedRaw =
    sections[sectionKey]?.[fieldKey] ??
    (typeof children === "string" ? children : null);

  const editor = useMemo(
    () => withReact(createEditor() as BaseEditor & ReactEditor),
    []
  );

  const initialValue = useMemo(
    () => (savedRaw ? createInitialValue(savedRaw) : undefined),
    [savedRaw]
  );

  const handleValueChange = useCallback(
    (value: Descendant[]) => {
      const text = value
        .map((node) => {
          if ("children" in node) {
            return node.children
              .map((child) => ("text" in child ? child.text : ""))
              .join("");
          }
          return "";
        })
        .join("\n");

      editField(sectionKey, fieldKey, text);
    },
    [sectionKey, fieldKey, editField]
  );

  const handleBlur = useCallback(async () => {
    await saveSection(sectionKey);
  }, [sectionKey, saveSection]);

  if (!isEditing) {
    if (savedRaw) {
      return (
        <span className={className}>
          <RenderStatic raw={savedRaw} />
        </span>
      );
    }
    return <span className={className}>{children}</span>;
  }

  if (!initialValue) return <span className={className}>{children}</span>;

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onValueChange={handleValueChange}
    >
      <Editable
        suppressHydrationWarning
        readOnly={!isEditing}
        renderLeaf={renderLeaf}
        onBlur={handleBlur}
        className={className}
        style={{
          display: "inline",
          padding: 0,
          margin: 0,
          outline: "none",
          cursor: "text",
        }}
      />
    </Slate>
  );
}
