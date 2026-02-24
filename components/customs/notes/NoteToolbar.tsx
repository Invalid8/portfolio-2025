import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Loader2Icon,
  CameraIcon,
  Maximize2Icon,
  Minimize2Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  BaselineIcon,
  HighlighterIcon,
  NotebookIcon,
} from "lucide-react";
import { COLORS } from "@/lib/notes-canvas";
import { useRef } from "react";

type Props = {
  onColor: (color: string) => void;
  onHighlight: (color: string) => void;
  onPageColor: (color: string) => void;
  onFormat: (cmd: string) => void;
  onAlign: (alignment: "left" | "center" | "right") => void;
  fontSize: number;
  pageColor: string;
  onSizeChange: (size: number) => void;
  onScreenshot: () => void;
  capturing: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  mobileMenuButton?: React.ReactNode;
  extra?: React.ReactNode;
};

const TEXT_COLORS = COLORS.slice(0, 5);

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "None", value: "transparent" },
];

const PAGE_COLORS = [
  { label: "Parchment", value: "#fdf9f0" },
  { label: "White", value: "#ffffff" },
  { label: "Soft Yellow", value: "#fefce8" },
  { label: "Light Grey", value: "#f3f4f6" },
];

const tbBtn = "p-2 rounded transition-all cursor-pointer";

const sep = (
  <div
    className="w-px h-4 shrink-0"
    style={{ background: "rgba(255,255,255,0.08)" }}
  />
);

const groupIcon = (icon: React.ReactNode) => (
  <span
    className="shrink-0 flex items-center justify-center"
    style={{ color: "#3a3a3a", width: 14, height: 14 }}
  >
    {icon}
  </span>
);

export default function NoteToolbar({
  onColor,
  onHighlight,
  onPageColor,
  onFormat,
  onAlign,
  fontSize,
  pageColor,
  onSizeChange,
  onScreenshot,
  capturing,
  expanded,
  onToggleExpand,
  mobileMenuButton,
  extra,
}: Props) {
  const textPickerRef = useRef<HTMLInputElement>(null);
  const highlightPickerRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2 rounded-t-xl flex-wrap"
      style={{
        background: "#111109",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        minHeight: 48,
      }}
    >
      {mobileMenuButton && (
        <>
          {mobileMenuButton}
          {sep}
        </>
      )}

      <div className="flex items-center gap-1.5 shrink-0">
        {groupIcon(<BaselineIcon style={{ width: 12, height: 12 }} />)}
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onColor(c.value)}
            className="rounded-full shrink-0 transition-all hover:scale-125 cursor-pointer"
            style={{
              width: 13,
              height: 13,
              background: c.value,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
            }}
            title={`Text color: ${c.label}`}
          />
        ))}
        <div className="relative">
          <button
            onClick={() => textPickerRef.current?.click()}
            className="rounded-full shrink-0 transition-all hover:scale-125 cursor-pointer"
            style={{
              width: 13,
              height: 13,
              background:
                "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.15)",
            }}
            title="Custom text color"
          />
          <input
            ref={textPickerRef}
            type="color"
            defaultValue="#1a1a2e"
            onChange={(e) => onColor(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
      </div>

      {sep}

      <div className="flex items-center gap-1.5 shrink-0">
        {groupIcon(<HighlighterIcon style={{ width: 12, height: 12 }} />)}
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onHighlight(c.value)}
            className="rounded-sm shrink-0 transition-all hover:scale-125 cursor-pointer border"
            style={{
              width: 13,
              height: 13,
              background: c.value === "transparent" ? "#1a1a1a" : c.value,
              borderColor:
                c.value === "transparent"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.15)",
            }}
            title={`Highlight: ${c.label}`}
          />
        ))}
        <div className="relative">
          <button
            onClick={() => highlightPickerRef.current?.click()}
            className="rounded-sm shrink-0 transition-all hover:scale-125 cursor-pointer border"
            style={{
              width: 13,
              height: 13,
              background:
                "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
              borderColor: "rgba(255,255,255,0.15)",
            }}
            title="Custom highlight color"
          />
          <input
            ref={highlightPickerRef}
            type="color"
            defaultValue="#fef08a"
            onChange={(e) => onHighlight(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
      </div>

      {sep}

      <div className="flex items-center gap-1.5 shrink-0">
        {groupIcon(<NotebookIcon style={{ width: 12, height: 12 }} />)}
        {PAGE_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onPageColor(c.value)}
            className="rounded-sm shrink-0 transition-all hover:scale-125 cursor-pointer border"
            style={{
              width: 13,
              height: 13,
              background: c.value,
              borderColor:
                pageColor === c.value ? "#e85d26" : "rgba(0,0,0,0.2)",
              boxShadow: pageColor === c.value ? "0 0 0 1px #e85d26" : "none",
            }}
            title={`Page: ${c.label}`}
          />
        ))}
      </div>

      {sep}

      <button
        onClick={() => onFormat("bold")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Bold"
      >
        <BoldIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("italic")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Italic"
      >
        <ItalicIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("underline")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onFormat("strikeThrough")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Strikethrough"
      >
        <StrikethroughIcon className="w-4 h-4" />
      </button>

      {sep}

      <button
        onClick={() => onAlign("left")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Align Left"
      >
        <AlignLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onAlign("center")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Align Center"
      >
        <AlignCenterIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onAlign("right")}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Align Right"
      >
        <AlignRightIcon className="w-4 h-4" />
      </button>

      {sep}

      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px] font-mono uppercase tracking-widest hidden sm:block"
          style={{ color: "#444" }}
        >
          Size
        </span>
        <input
          type="range"
          min={14}
          max={40}
          value={fontSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-16 sm:w-20"
          style={{ accentColor: "#e85d26" }}
        />
        <span
          className="text-[10px] font-mono w-5 tabular-nums"
          style={{ color: "#555" }}
        >
          {fontSize}
        </span>
      </div>

      {sep}

      <button
        onClick={onScreenshot}
        disabled={capturing}
        className={tbBtn}
        style={{ color: "#666" }}
        onMouseEnter={(e) => {
          if (!capturing) e.currentTarget.style.color = "#ddd";
        }}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        title="Save as image"
      >
        {capturing ? (
          <Loader2Icon className="w-4 h-4 animate-spin" />
        ) : (
          <CameraIcon className="w-4 h-4" />
        )}
      </button>

      {sep}

      <button
        onClick={onToggleExpand}
        className={tbBtn}
        style={{ color: expanded ? "#e85d26" : "#666" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = expanded ? "#e85d26" : "#ddd")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = expanded ? "#e85d26" : "#666")
        }
        title={expanded ? "Exit fullscreen" : "Fullscreen"}
      >
        {expanded ? (
          <Minimize2Icon className="w-4 h-4" />
        ) : (
          <Maximize2Icon className="w-4 h-4" />
        )}
      </button>

      {extra && (
        <>
          {sep}
          {extra}
        </>
      )}
    </div>
  );
}
