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
  RenderElementProps,
} from "slate-react";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";
import { cn } from "@/lib/utils";

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

const renderElement = (props: RenderElementProps) => {
  return (
    <span {...props.attributes} style={{ display: "inline" }}>
      {props.children}
    </span>
  );
};

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

        return (
          <span key={i} className="inline">
            {el}
          </span>
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
  const { sections, editField } = usePageContext();
  const { isEditing } = useAuth();

  const raw =
    sections[sectionKey]?.[fieldKey] ??
    (typeof children === "string" ? children : "");

  if (!isEditing) {
    return (
      <span className={className}>
        <RenderStatic raw={raw} />
      </span>
    );
  }

  return (
    <EditableContentSpan
      key={`${sectionKey}-${fieldKey}`}
      sectionKey={sectionKey}
      fieldKey={fieldKey}
      className={className}
      raw={raw}
      editField={editField}
    />
  );
}

function EditableContentSpan({
  sectionKey,
  fieldKey,
  className,
  raw,
  editField,
}: {
  sectionKey: string;
  fieldKey: string;
  className?: string;
  raw: string;
  editField: (sectionKey: string, fieldKey: string, value: string) => void;
}) {
  const { isEditing } = useAuth();
  const [isFocused, setIsFocused] = useState(false);

  const editor = useMemo(
    () => withReact(createEditor() as BaseEditor & ReactEditor),
    [],
  );

  const [value, setValue] = useState<Descendant[]>(() =>
    createInitialValue(raw),
  );

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const serialized = serialize(value);
    if (serialized !== raw) {
      editField(sectionKey, fieldKey, serialized);
    }
  }, [value, sectionKey, fieldKey, editField, raw]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <Slate editor={editor} initialValue={value} onChange={handleChange}>
      <Editable
        as="span"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn(
          className,
          "transition-all duration-200 cursor-text",
          isFocused &&
            "ring-2 ring-primary/50 ring-offset-2 ring-offset-neutral-900 rounded-sm px-1",
          !isFocused &&
            isEditing &&
            "hover:ring-1 hover:ring-primary/30 hover:ring-offset-1 hover:ring-offset-neutral-900 hover:rounded-sm hover:px-1",
        )}
        style={{
          display: "inline",
          padding: 0,
          margin: 0,
          outline: "none",
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          whiteSpace: "pre-wrap",
        }}
      />
    </Slate>
  );
}
