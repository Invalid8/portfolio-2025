"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ShrinkIcon, PenLineIcon, ArrowUpRightIcon } from "lucide-react";
import {
  TORN_BOTTOM,
  HEADER_H,
  ensureFontLoaded,
  drawNoteCanvas,
} from "@/lib/notes-canvas";
import NoteToolbar from "@/components/customs/notes/NoteToolbar";
import Link from "next/link";

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

type Props = { mobileOnly?: boolean };

export default function ScribbleNote({ mobileOnly = false }: Props) {
  const [html, setHtml] = useState<string>(
    () => loadStorage()?.html ?? DEFAULT_HTML,
  );
  const [fontSize, setFontSize] = useState<number>(
    () => loadStorage()?.fontSize ?? 20,
  );
  const [open, setOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const noteWrapperRef = useRef<HTMLDivElement>(null);
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
    if (open) {
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
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

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

  const handleScreenshot = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const cssFontName = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-caveat")
        .trim();
      const fontFamily = cssFontName || "Caveat";
      await ensureFontLoaded(fontFamily, fontSize);
      const actualWidth = noteWrapperRef.current?.offsetWidth ?? 640;
      const canvas = drawNoteCanvas(html, fontSize, fontFamily, actualWidth);
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

  const modal =
    typeof window !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(8,6,4,0.93)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <style>{`
            @keyframes noteIn {
              from { opacity:0; transform: scale(0.93); }
              to { opacity:1; transform: scale(1); }
            }
            .scribble-content * { font-family: var(--font-caveat), cursive !important; }
            .scribble-content strong { font-weight: 700; }
            .scribble-content em { font-style: italic; }
            .scribble-content u { text-decoration: underline; }
            .scribble-content s { text-decoration: line-through; }
            .scribble-content font { font-family: var(--font-caveat), cursive !important; }
          `}</style>

            <div
              ref={noteWrapperRef}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: "min(640px, 100%)",
                maxHeight: "90vh",
                filter: "drop-shadow(0 32px 80px rgba(0,0,0,0.9))",
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
                expanded={false}
                onToggleExpand={() => {}}
                extra={
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      color: "#666",
                      padding: 8,
                      borderRadius: 4,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      display: "flex",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                    title="Close (Esc)"
                  >
                    <ShrinkIcon style={{ width: 16, height: 16 }} />
                  </button>
                }
              />

              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  flex: 1,
                  background: "#fdf9f0",
                  minHeight: 320,
                  maxHeight: "calc(90vh - 52px)",
                  clipPath: TORN_BOTTOM,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_H,
                    background:
                      "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)",
                    borderBottom: "2px solid #d4c9a8",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingLeft: 80,
                    paddingRight: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-caveat), cursive",
                      fontSize: 18,
                      color: "#c4b898",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    quick note
                  </span>
                  <Link
                    href="/notes"
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      color: "#b8a88a",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#8a6d3b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#b8a88a")
                    }
                    title="Open full notes"
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-caveat), cursive",
                        fontSize: 14,
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                      }}
                    >
                      full notes
                    </span>
                    <ArrowUpRightIcon style={{ width: 12, height: 12 }} />
                  </Link>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 56,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: HEADER_H + lineHeight,
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        flexShrink: 0,
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
                  className="scribble-content"
                  style={{
                    position: "relative",
                    outline: "none",
                    overflowY: "auto",
                    fontFamily: "var(--font-caveat), cursive",
                    color: "#1a1a2e",
                    ...paperLines,
                    fontSize,
                    lineHeight: `${lineHeight}px`,
                    paddingTop: `${contentPadTop}px`,
                    paddingBottom: 60,
                    paddingLeft: 76,
                    paddingRight: 36,
                    minHeight: 320,
                    maxHeight: "calc(90vh - 120px)",
                    caretColor: "#1a1a2e",
                    wordBreak: "break-word",
                    zIndex: 3,
                  }}
                />

                {isEmpty && (
                  <div
                    style={{
                      position: "absolute",
                      top: contentPadTop,
                      left: 76,
                      zIndex: 4,
                      fontFamily: "var(--font-caveat), cursive",
                      fontSize,
                      lineHeight: `${lineHeight}px`,
                      color: "#b0a898",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    Write something…
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  if (mobileOnly) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden inline-flex items-center w-fit gap-2 px-4 py-2.5 rounded-full border border-neutral-700 text-sm font-mono tracking-wider text-neutral-400 hover:border-primary/50 hover:text-primary transition-all active:scale-95"
        >
          <PenLineIcon className="w-4 h-4" />
          Quick Note
        </button>
        {open && modal}
      </>
    );
  }

  return (
    <>
      <style>{`
        .note-preview-line {
          font-family: var(--font-caveat), cursive;
          font-size: 15px; line-height: 26px; height: 26px;
          color: #2a2440; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
      `}</style>

      <div className="hidden lg:flex flex-col items-end justify-center flex-shrink-0 w-[200px] xl:w-[300px]">
        <button
          onClick={() => setOpen(true)}
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

      {open && modal}
    </>
  );
}
