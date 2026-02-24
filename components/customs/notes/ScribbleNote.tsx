"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ShrinkIcon, NotebookIcon, PenLineIcon } from "lucide-react";
import {
  TORN_BOTTOM,
  HEADER_H,
  DISCLAIMER_KEY,
  ensureFontLoaded,
  drawNoteCanvas,
} from "@/lib/notes-canvas";
import NoteToolbar from "@/components/customs/notes/NoteToolbar";

const STORAGE_KEY = "portfolio-scribble-note";
const DEFAULT_HTML =
  "Hey, got something on your mind?<br>Jot it down — this saves automatically. 🖊️";

function loadStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStorage(html: string, fontSize: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, fontSize }));
  } catch {}
}

function htmlToPreviewLines(html: string): string[] {
  if (typeof document === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
  const text = div.innerText || div.textContent || "";
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default function ScribbleNote() {
  const [html, setHtml] = useState<string>(
    () => loadStorage()?.html ?? DEFAULT_HTML,
  );
  const [fontSize, setFontSize] = useState<number>(
    () => loadStorage()?.fontSize ?? 20,
  );
  const [expanded, setExpanded] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(DISCLAIMER_KEY);
    } catch {
      return false;
    }
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeight = Math.round(fontSize * 1.72);
  const contentPadTop = HEADER_H + Math.round(lineHeight * 0.5);
  const lineGridOffset = contentPadTop % lineHeight;

  const paperLines: React.CSSProperties = {
    backgroundImage: [
      `repeating-linear-gradient(transparent, transparent ${lineHeight - 1}px, #c8d8e8 ${lineHeight - 1}px, #c8d8e8 ${lineHeight}px)`,
      `linear-gradient(to right, transparent 56px, #e8a0a0 56px, #e8a0a0 58px, transparent 58px)`,
    ].join(", "),
    backgroundPositionY: `${lineGridOffset}px`,
  };

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
      if (contentRef.current) {
        contentRef.current.innerHTML = html;
        setIsEmpty(contentRef.current.innerText.trim() === "");
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        contentRef.current.focus();
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const handleInput = useCallback(() => {
    if (!contentRef.current) return;
    const next = contentRef.current.innerHTML;
    setHtml(next);
    setIsEmpty(contentRef.current.innerText.trim() === "");
    saveStorage(next, fontSize);
  }, [fontSize]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault();
        document.execCommand("bold");
      }
      if (e.key === "i") {
        e.preventDefault();
        document.execCommand("italic");
      }
      if (e.key === "u") {
        e.preventDefault();
        document.execCommand("underline");
      }
    }
  }, []);

  const applyColor = useCallback(
    (color: string) => {
      contentRef.current?.focus();
      document.execCommand("foreColor", false, color);
      if (contentRef.current) {
        const next = contentRef.current.innerHTML;
        setHtml(next);
        saveStorage(next, fontSize);
      }
    },
    [fontSize],
  );

  const execFormat = useCallback(
    (cmd: string) => {
      contentRef.current?.focus();
      document.execCommand(cmd);
      if (contentRef.current) {
        const next = contentRef.current.innerHTML;
        setHtml(next);
        saveStorage(next, fontSize);
      }
    },
    [fontSize],
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      setFontSize(size);
      saveStorage(html, size);
    },
    [html],
  );

  const dismissDisclaimer = useCallback(() => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, "1");
    } catch {}
    setShowDisclaimer(false);
  }, []);

  const handleScreenshot = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const cssFontName = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-caveat")
        .trim();
      const fontFamily = cssFontName || "Caveat";
      await ensureFontLoaded(fontFamily, fontSize);
      const canvas = drawNoteCanvas(html, fontSize, fontFamily);
      canvas.toBlob((blob) => {
        if (!blob) {
          setCapturing(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-note.png";
        a.click();
        URL.revokeObjectURL(url);
        setCapturing(false);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setCapturing(false);
    }
  }, [capturing, html, fontSize]);

  const previewLines = htmlToPreviewLines(html);

  return (
    <>
      <style>{`
        .scribble-content * { font-family: var(--font-caveat), cursive !important; }
        .scribble-content strong { font-weight: 700; }
        .scribble-content em { font-style: italic; }
        .scribble-content u { text-decoration: underline; }
        .scribble-content s { text-decoration: line-through; }
        .scribble-content font { font-family: var(--font-caveat), cursive !important; }
        .note-preview-line {
          font-family: var(--font-caveat), cursive;
          font-size: 15px; line-height: 26px; height: 26px;
          color: #2a2440; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        @keyframes noteIn {
          from { opacity:0; transform: scale(0.93) rotate(-0.4deg); }
          to { opacity:1; transform: scale(1) rotate(-0.4deg); }
        }
      `}</style>

      <div className="hidden lg:flex flex-col items-end justify-center flex-shrink-0 w-[200px] xl:w-[300px]">
        <button
          onClick={() => setExpanded(true)}
          className="group relative w-full cursor-pointer focus:outline-none"
          title="Open note"
        >
          <div
            className="relative w-full transition-all duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]"
            style={{
              background: "#fdf9f0",
              rotate: "1.5deg",
              boxShadow:
                "4px 8px 28px rgba(0,0,0,0.55), 1px 2px 6px rgba(0,0,0,0.3)",
              clipPath: TORN_BOTTOM,
            }}
          >
            <div
              style={{
                height: 36,
                background:
                  "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)",
                borderBottom: "1.5px solid #d4c9a8",
              }}
            />
            <div
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 25px, #ccd9e8 25px, #ccd9e8 26px), linear-gradient(to right, transparent 32px, #e8a0a0 32px, #e8a0a0 33.5px, transparent 33.5px)`,
                paddingTop: 5,
                paddingBottom: 18,
                paddingLeft: 42,
                paddingRight: 10,
              }}
            >
              {previewLines.length > 0 ? (
                previewLines.map((line, i) => (
                  <div key={i} className="note-preview-line">
                    {line}
                  </div>
                ))
              ) : (
                <div className="note-preview-line" style={{ opacity: 0.3 }}>
                  Start writing…
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-neutral-600 group-hover:text-neutral-400 transition-colors">
            <PenLineIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-widest uppercase">
              Click to write
            </span>
          </div>
        </button>
      </div>

      {expanded && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(12,10,8,0.88)",
              backdropFilter: "blur(8px)",
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
                filter: "drop-shadow(0 32px 80px rgba(0,0,0,0.8))",
                animation: "noteIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              <NoteToolbar
                onColor={applyColor}
                onFormat={execFormat}
                fontSize={fontSize}
                onSizeChange={handleSizeChange}
                onScreenshot={handleScreenshot}
                capturing={capturing}
                extra={
                  <>
                    <button
                      onClick={() => window.open("/notes", "_blank")}
                      className="p-2 rounded transition-all cursor-pointer"
                      style={{ color: "#666" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ddd")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#666")
                      }
                      title="Open full notes (new tab)"
                    >
                      <NotebookIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpanded(false)}
                      className="p-2 rounded transition-all cursor-pointer"
                      style={{ color: "#666" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ddd")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#666")
                      }
                      title="Close"
                    >
                      <ShrinkIcon className="w-4 h-4" />
                    </button>
                  </>
                }
              />

              <div
                className="relative overflow-hidden"
                style={{
                  background: "#fdf9f0",
                  minHeight: 380,
                  maxHeight: "calc(90vh - 52px)",
                  clipPath: TORN_BOTTOM,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: HEADER_H,
                    background:
                      "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)",
                    borderBottom: "2px solid #d4c9a8",
                    zIndex: 2,
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ paddingLeft: 58 }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-caveat), cursive",
                        fontSize: 18,
                        color: "#c4b898",
                        userSelect: "none",
                        letterSpacing: "0.01em",
                      }}
                    >
                      quick note
                    </span>
                  </div>
                </div>

                <div
                  className="absolute top-0 bottom-0 left-0 w-14 flex flex-col items-center pointer-events-none z-10"
                  style={{ paddingTop: HEADER_H + lineHeight }}
                >
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: 16,
                        height: 16,
                        background: "#1a1410",
                        marginBottom: `${lineHeight * 4 - 16}px`,
                        boxShadow:
                          "inset 0 2px 5px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>

                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  className="scribble-content relative outline-none overflow-y-auto"
                  style={{
                    fontFamily: "var(--font-caveat), cursive",
                    color: "#1a1a2e",
                    ...paperLines,
                    fontSize,
                    lineHeight: `${lineHeight}px`,
                    paddingTop: `${contentPadTop}px`,
                    paddingBottom: "60px",
                    paddingLeft: "76px",
                    paddingRight: "36px",
                    minHeight: 380,
                    maxHeight: "calc(90vh - 120px)",
                    caretColor: "#1a1a2e",
                    wordBreak: "break-word",
                    zIndex: 3,
                  }}
                />

                {isEmpty && (
                  <div
                    className="absolute pointer-events-none select-none"
                    style={{
                      top: contentPadTop,
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
        </>
      )}
    </>
  );
}
