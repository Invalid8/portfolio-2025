import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Loader2Icon,
  CameraIcon,
  BaselineIcon,
} from "lucide-react";
import { COLORS } from "@/lib/notes-canvas";
import { useRef } from "react";

const TEXT_COLORS = COLORS.slice(0, 5);

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

type Props = {
  onColor: (color: string) => void;
  onFormat: (cmd: string) => void;
  fontSize: number;
  onSizeChange: (size: number) => void;
  onScreenshot: () => void;
  capturing: boolean;
  extra?: React.ReactNode;
};

export default function ScribbleToolbar({
  onColor,
  onFormat,
  fontSize,
  onSizeChange,
  onScreenshot,
  capturing,
  extra,
}: Props) {
  const textPickerRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2 rounded-t-xl flex-wrap"
      style={{
        background: "#111109",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        minHeight: 44,
      }}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        {groupIcon(<BaselineIcon style={{ width: 12, height: 12 }} />)}
        {TEXT_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onColor(c.value)}
            className="rounded-full shrink-0 transition-all hover:scale-125 cursor-pointer"
            style={{
              width: 12,
              height: 12,
              background: c.value,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
            }}
            title={`Text: ${c.label}`}
          />
        ))}
        <div className="relative">
          <button
            onClick={() => textPickerRef.current?.click()}
            className="rounded-full shrink-0 transition-all hover:scale-125 cursor-pointer"
            style={{
              width: 12,
              height: 12,
              background:
                "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.15)",
            }}
            title="Custom color"
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
        <input
          type="range"
          min={14}
          max={36}
          value={fontSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-16"
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

      {extra && (
        <>
          {sep}
          {extra}
        </>
      )}
    </div>
  );
}
