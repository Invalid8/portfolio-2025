"use client";

import React, { useMemo, useCallback, useState, useRef } from "react";
import {
  createEditor,
  BaseEditor,
  Descendant,
  Text,
  Element as SlateElement,
  Transforms,
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
  collection?: string;
  sectionKey: string;
  fieldKey: string;
  className?: string;
  children: React.ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
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
        out.push({ text: "\n", break: true });
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
  return <span {...props.attributes}>{props.children}</span>;
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

  return <span {...attributes}>{el}</span>;
};

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

  const raw =
    sections[collection]?.[sectionKey]?.[fieldKey] ??
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
  const [localValue, setLocalValue] = useState(raw);
  const savedRawRef = useRef(raw);

  const editor = useMemo(
    () => withReact(createEditor() as BaseEditor & ReactEditor),
    [],
  );

  const initialValue = useMemo(() => {
    return [
      {
        type: "paragraph",
        children: parseSpecialString(localValue),
      } as ParagraphElement,
    ];
  }, [localValue]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    const newText = serialize(newValue);
    setLocalValue(newText);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (localValue !== savedRawRef.current) {
      savedRawRef.current = localValue;
      editField(collection!, sectionKey, fieldKey, localValue);
    }
  }, [localValue, collection, sectionKey, fieldKey, editField]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleDOMBeforeInput = useCallback(
    (e: Event) => {
      const inputEvent = e as InputEvent;
      if (inputEvent.inputType === "insertLineBreak") {
        e.preventDefault();
        Transforms.insertText(editor, "\n");
      }
    },
    [editor],
  );

  return (
    <Component
      className={cn(
        className,
        "relative",
        isFocused &&
          "ring-2 ring-primary/50 ring-offset-2 ring-offset-neutral-900 rounded-sm px-2",
        !isFocused &&
          isEditing &&
          "hover:ring-1 hover:ring-primary/30 hover:ring-offset-1 hover:ring-offset-neutral-900 hover:rounded-sm hover:px-2",
      )}
    >
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={handleChange}
        key={`${collection}-${sectionKey}-${fieldKey}`}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onDOMBeforeInput={handleDOMBeforeInput}
          className="outline-none w-full"
          placeholder={isEditing ? "Click to edit..." : ""}
        />
      </Slate>
    </Component>
  );
}
