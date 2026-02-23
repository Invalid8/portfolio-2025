"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ShrinkIcon, PenLineIcon } from "lucide-react";

const STORAGE_KEY = "portfolio-scribble-note";
const DEFAULT_TEXT =
  "Hey, got something on your mind?\nJot it down — this note saves automatically. 🖊️";

const COLORS = [
  { label: "Dark", value: "#1a1a2e" },
  { label: "Navy", value: "#00008b" },
  { label: "Forest", value: "#1a3a1a" },
  { label: "Crimson", value: "#8b0000" },
  { label: "Plum", value: "#6b21a8" },
];

function loadStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStorage(text: string, inkColor: string, fontSize: number) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ text, inkColor, fontSize }),
    );
  } catch {}
}

export default function ScribbleNote() {
  const [text, setText] = useState<string>(() => {
    const saved = loadStorage();
    return saved?.text ?? DEFAULT_TEXT;
  });
  const [inkColor, setInkColor] = useState<string>(() => {
    const saved = loadStorage();
    return saved?.inkColor ?? COLORS[0].value;
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = loadStorage();
    return saved?.fontSize ?? 20;
  });
  const [expanded, setExpanded] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeight = Math.round(fontSize * 1.72);

  useEffect(() => {
    if (expanded && contentRef.current) {
      contentRef.current.innerText = text;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      contentRef.current.focus();
    }
  }, [expanded]);

  const handleInput = useCallback(() => {
    const val = contentRef.current?.innerText ?? "";
    setText(val);
    saveStorage(val, inkColor, fontSize);
  }, [inkColor, fontSize]);

  const handleColorChange = useCallback(
    (color: string) => {
      setInkColor(color);
      saveStorage(text, color, fontSize);
    },
    [text, fontSize],
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      setFontSize(size);
      saveStorage(text, inkColor, size);
    },
    [text, inkColor],
  );

  const paperStyle: React.CSSProperties = {
    fontFamily: "var(--font-caveat), cursive",
    fontSize,
    lineHeight: `${lineHeight}px`,
    color: inkColor,
    backgroundImage: [
      `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #c8d8e8 ${lineHeight - 1}px, #c8d8e8 ${lineHeight}px)`,
      `linear-gradient(to right, transparent 56px, #e8a0a0 56px, #e8a0a0 58px, transparent 58px)`,
    ].join(", "),
    backgroundPositionY: "24px",
  };

  const previewLines = text.split("\n").slice(0, 3);

  return (
    <>
      <div className="hidden lg:flex flex-col items-end justify-center flex-shrink-0 w-[200px] xl:w-[320px]">
        <button
          onClick={() => setExpanded(true)}
          className="group relative w-full cursor-pointer focus:outline-none"
          title="Open note"
        >
          <div
            className="relative w-full rounded-lg overflow-hidden transition-all duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]"
            style={{
              background: "#fdf9f0",
              rotate: "1.5deg",
              boxShadow:
                "4px 6px 20px rgba(0,0,0,0.4), 1px 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-2 z-10 pointer-events-none"
              style={{
                background: "#fdf9f0",
                clipPath:
                  "polygon(0 100%,3% 30%,6% 80%,9% 10%,12% 60%,15% 20%,18% 75%,21% 30%,24% 70%,27% 15%,30% 65%,33% 25%,36% 70%,39% 10%,42% 55%,45% 25%,48% 75%,51% 15%,54% 65%,57% 30%,60% 80%,63% 20%,66% 70%,69% 5%,72% 55%,75% 25%,78% 70%,81% 15%,84% 65%,87% 30%,90% 80%,93% 20%,96% 65%,100% 30%,100% 100%)",
              }}
            />
            <div
              className="px-3 pt-7 pb-6"
              style={{
                ...paperStyle,
                fontSize: 13,
                lineHeight: "22px",
                backgroundPositionY: "0px",
              }}
            >
              {previewLines.length > 0 ? (
                previewLines.map((line, i) => (
                  <div
                    key={i}
                    className="truncate opacity-80"
                    style={{ minHeight: 22 }}
                  >
                    {line || "\u00a0"}
                  </div>
                ))
              ) : (
                <div className="opacity-40">Start writing…</div>
              )}
            </div>
            <div
              className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
              style={{
                background: "linear-gradient(225deg, var(--primary) 50%, #22201d 50%)",
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-300 group-hover:text-neutral-400 transition-colors">
            <PenLineIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-widest uppercase">
              Click to write
            </span>
          </div>
        </button>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(20,16,12,0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div
            className="relative flex flex-col"
            style={{
              width: "min(640px, 96vw)",
              maxHeight: "90vh",
              filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.7))",
              animation: "noteIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <style>{`
              @keyframes noteIn {
                from { opacity:0; transform: scale(0.94) rotate(-0.4deg); }
                to   { opacity:1; transform: scale(1)    rotate(-0.4deg); }
              }
            `}</style>

            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-t-xl flex-wrap"
              style={{
                background: "#2a2218",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleColorChange(c.value)}
                  className="rounded-full transition-all duration-150 flex-shrink-0"
                  style={{
                    width: 18,
                    height: 18,
                    background: c.value,
                    outline:
                      inkColor === c.value
                        ? "2px solid white"
                        : "2px solid transparent",
                    outlineOffset: 2,
                    transform: inkColor === c.value ? "scale(1.2)" : "scale(1)",
                  }}
                  title={c.label}
                />
              ))}

              <div className="w-px h-4 bg-white/10" />

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Size
                </span>
                <input
                  type="range"
                  min={14}
                  max={40}
                  value={fontSize}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="w-20 accent-white opacity-50 hover:opacity-80 transition-opacity"
                />
                <span className="text-[10px] font-mono text-white/30 w-5 tabular-nums">
                  {fontSize}
                </span>
              </div>

              <div className="ml-auto">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                  title="Close"
                >
                  <ShrinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="relative overflow-hidden"
              style={{
                background: "#fdf9f0",
                minHeight: 420,
                maxHeight: "calc(90vh - 52px)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: 14,
                  background: "#fdf9f0",
                  clipPath:
                    "polygon(0 100%,1% 30%,2.5% 80%,4% 20%,5.5% 70%,7% 10%,8.5% 65%,10% 25%,11.5% 75%,13% 15%,14.5% 60%,16% 20%,17.5% 80%,19% 30%,20.5% 70%,22% 5%,23.5% 55%,25% 20%,26.5% 75%,28% 35%,29.5% 80%,31% 15%,32.5% 65%,34% 25%,35.5% 70%,37% 10%,38.5% 60%,40% 30%,41.5% 85%,43% 20%,44.5% 70%,46% 10%,47.5% 55%,49% 25%,50.5% 75%,52% 15%,53.5% 65%,55% 30%,56.5% 80%,58% 20%,59.5% 70%,61% 5%,62.5% 60%,64% 20%,65.5% 75%,67% 35%,68.5% 80%,70% 10%,71.5% 55%,73% 25%,74.5% 70%,76% 15%,77.5% 65%,79% 30%,80.5% 85%,82% 20%,83.5% 70%,85% 10%,86.5% 60%,88% 30%,89.5% 75%,91% 15%,92.5% 65%,94% 25%,95.5% 75%,97% 20%,98.5% 55%,100% 30%,100% 100%)",
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                  height: 52,
                  background: "linear-gradient(to bottom, #f5edda, #fdf9f0)",
                  borderBottom: "2px solid #ddd4b8",
                  zIndex: 2,
                }}
              />
              <div className="absolute top-0 bottom-0 left-0 w-12 flex flex-col items-center pt-12 pointer-events-none z-10">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      background: "#2a2420",
                      marginBottom: `${lineHeight * 4 - 16}px`,
                      boxShadow:
                        "inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>
              <div
                className="absolute bottom-0 right-0 z-10 pointer-events-none"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    "linear-gradient(225deg, #2a2420 50%, #e8dfc8 50%)",
                }}
              />
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                spellCheck={false}
                className="relative outline-none overflow-y-auto"
                style={{
                  ...paperStyle,
                  padding: `52px 36px 48px 76px`,
                  minHeight: 420,
                  maxHeight: "calc(90vh - 100px)",
                  caretColor: inkColor,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  zIndex: 3,
                }}
              />
              {!text && (
                <div
                  className="absolute pointer-events-none select-none"
                  style={{
                    top: 52,
                    left: 76,
                    zIndex: 4,
                    fontFamily: "var(--font-caveat), cursive",
                    fontSize,
                    lineHeight: `${lineHeight}px`,
                    color: "#b0a898",
                  }}
                >
                  Write something…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
