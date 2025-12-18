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
  link?: string;
};

// Converts raw text to Slate nodes
function createInitialValue(rawText: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: [{ text: rawText }] as CustomText[],
    } as ParagraphElement,
  ];
}

// Render individual leaves (marks)
const renderLeaf = (props: RenderLeafProps) => {
  let { children } = props;

  const leaf = props.leaf as CustomText;

  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.strike)
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  if (leaf.primary) children = <span className="text-primary">{children}</span>;
  if (leaf.link)
    children = (
      <a href={leaf.link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );

  return <span {...props.attributes}>{children}</span>;
};

export default function ContentSpan({
  sectionKey,
  fieldKey,
  className,
  children,
}: ContentSpanProps) {
  const { sections, editField, saveSection } = usePageContext();

  const editor = useMemo(
    () => withReact(createEditor() as BaseEditor & ReactEditor),
    []
  );

  const savedRaw =
    sections[sectionKey]?.[fieldKey] ?? children?.toString() ?? "";
  const initialValue = useMemo(() => createInitialValue(savedRaw), [savedRaw]);

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

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onValueChange={handleValueChange}
    >
      <Editable
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
