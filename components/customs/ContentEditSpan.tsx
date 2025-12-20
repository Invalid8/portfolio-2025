"use client";

import React, { useMemo, useCallback, useState } from "react";
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
  children: CustomText[];
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
        out.push({ text: "", break: true });
      } else if ("isLink" in p) {
        out.push({ text: m[1], link: m[2] });
      } else {
        const inner = parseSpecialString(m[1]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inner.forEach((n) => ((n as any)[p.mark] = true));
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

function createInitialValue(raw: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: parseSpecialString(raw),
    } as ParagraphElement,
  ];
}

function serialize(nodes: Descendant[]): string {
  return nodes
    .map((n) => {
      if (!("children" in n)) return "";
      return (
        n.children
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((l: any) => {
            if (l.break) return "~~br~~";
            let t = l.text;
            if (l.link) t = `[${t}](${l.link})`;
            if (l.underline) t = `__${t}__`;
            if (l.primary) t = `^^${t}^^`;
            if (l.strike) t = `~~${t}~~`;
            if (l.italic) t = `*${t}*`;
            if (l.bold) t = `**${t}**`;
            return t;
          })
          .join("")
      );
    })
    .join("\n");
}

const renderLeaf = ({ leaf, attributes, children }: RenderLeafProps) => {
  const l = leaf as CustomText;

  if (l.break) return <br {...attributes} />;

  let el = children;

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
      <a href={l.link} target="_blank" rel="noopener noreferrer">
        {el}
      </a>
    );
  }

  return (
    <span
      {...attributes}
      style={{
        display: "inline",
        padding: 0,
        margin: 0,
      }}
    >
      {el}
    </span>
  );
};

function RenderStatic({ raw }: { raw: string }) {
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
            <a href={l.link} target="_blank" rel="noopener noreferrer">
              {el}
            </a>
          );
        }

        return <React.Fragment key={i}>{el}</React.Fragment>;
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

  const raw =
    sections[sectionKey]?.[fieldKey] ??
    (typeof children === "string" ? children : "");

  const editor = useMemo(
    () => withReact(createEditor() as BaseEditor & ReactEditor),
    []
  );

  const [value, setValue] = useState<Descendant[]>(createInitialValue(raw));

  const handleBlur = useCallback(async () => {
    const serialized = serialize(value);
    editField(sectionKey, fieldKey, serialized);
    await saveSection(sectionKey);
  }, [value, sectionKey, fieldKey, editField, saveSection]);

  if (!isEditing) {
    return (
      <span className={className}>
        <RenderStatic raw={raw} />
      </span>
    );
  }

  return (
    <Slate editor={editor} initialValue={value} onChange={setValue}>
      <Editable
        renderLeaf={renderLeaf}
        onBlur={handleBlur}
        className={className}
        style={{
          display: "inline",
          padding: 0,
          margin: 0,
          outline: "none",
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          whiteSpace: "pre-wrap",
          cursor: "text",
        }}
      />
    </Slate>
  );
}
