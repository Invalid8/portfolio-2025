import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Loader2Icon,
  CameraIcon,
  Maximize2Icon,
  Minimize2Icon,
} from "lucide-react";
import { COLORS } from "@/lib/notes-canvas";

type Props = {
  onColor: (color: string) => void;
  onFormat: (cmd: string) => void;
  fontSize: number;
  onSizeChange: (size: number) => void;
  onScreenshot: () => void;
  capturing: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  mobileMenuButton?: React.ReactNode;
  extra?: React.ReactNode;
};

const tbBtn = "p-2 rounded transition-all cursor-pointer";
const sep = (
  <div
    className="w-px h-4 shrink-0"
    style={{ background: "rgba(255,255,255,0.08)" }}
  />
);

export default function NoteToolbar({
  onColor,
  onFormat,
  fontSize,
  onSizeChange,
  onScreenshot,
  capturing,
  expanded,
  onToggleExpand,
  mobileMenuButton,
  extra,
}: Props) {
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
        {COLORS.map((c) => (
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
            title={c.label}
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
        onMouseEnter={(e) => { if (!capturing) e.currentTarget.style.color = "#ddd"; }}
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
        onMouseEnter={(e) => (e.currentTarget.style.color = expanded ? "#e85d26" : "#ddd")}
        onMouseLeave={(e) => (e.currentTarget.style.color = expanded ? "#e85d26" : "#666")}
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