"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2Icon, PlusIcon, XIcon, MenuIcon } from "lucide-react";
import {
  TORN_BOTTOM,
  HEADER_H,
  ensureFontLoaded,
  drawNoteCanvas,
} from "@/lib/notes-canvas";
import { useNotes } from "@/lib/context/notes-context";
import NoteToolbar from "@/components/customs/notes/NoteToolbar";
import NotesSharePanel from "@/components/customs/notes/NotesSharePanel";

export default function NotesEditor() {
  const {
    activeNote,
    activeTabId,
    loaded,
    contentRef,
    expanded,
    toggleExpanded,
    setActiveNote,
    setActiveTabId,
    persistNote,
    addTab,
    removeTab,
    commitTabTitle,
    showMobileSidebar,
    toggleMobileSidebar,
  } = useNotes();

  const [capturing, setCapturing] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabDraft, setTabDraft] = useState("");
  const [showShare, setShowShare] = useState(false);
  const tabInputRef = useRef<HTMLInputElement>(null);
  const noteWrapperRef = useRef<HTMLDivElement>(null);

  const activeTab = activeNote?.tabs.find((t) => t.id === activeTabId) ?? null;
  const fontSize = activeNote?.fontSize ?? 20;
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
    if (!loaded || !activeTab || !contentRef.current) return;
    contentRef.current.innerHTML = activeTab.html;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(contentRef.current);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [activeTabId, activeNote?.id, loaded, activeTab, contentRef]);

  useEffect(() => {
    if (editingTabId) tabInputRef.current?.focus();
  }, [editingTabId]);

  const handleInput = useCallback(() => {
    if (!contentRef.current || !activeNote || !activeTab) return;
    const html = contentRef.current.innerHTML;
    const updatedTabs = activeNote.tabs.map((t) =>
      t.id === activeTabId ? { ...t, html, updatedAt: Date.now() } : t,
    );
    const updated = { ...activeNote, tabs: updatedTabs };
    setActiveNote(updated);
    persistNote(updated);
  }, [activeNote, activeTab, activeTabId, persistNote, setActiveNote, contentRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") { e.preventDefault(); document.execCommand("bold"); }
      if (e.key === "i") { e.preventDefault(); document.execCommand("italic"); }
      if (e.key === "u") { e.preventDefault(); document.execCommand("underline"); }
    }
  }, []);

  const applyColor = useCallback(
    (color: string) => {
      contentRef.current?.focus();
      document.execCommand("foreColor", false, color);
      handleInput();
    },
    [handleInput, contentRef],
  );

  const applyHighlight = useCallback(
    (color: string) => {
      contentRef.current?.focus();
      document.execCommand("hiliteColor", false, color);
      handleInput();
    },
    [handleInput, contentRef],
  );

  const execFormat = useCallback(
    (cmd: string) => {
      contentRef.current?.focus();
      document.execCommand(cmd);
      handleInput();
    },
    [handleInput, contentRef],
  );

  const applyAlign = useCallback(
    (alignment: "left" | "center" | "right") => {
      contentRef.current?.focus();
      const cmdMap = {
        left: "justifyLeft",
        center: "justifyCenter",
        right: "justifyRight",
      };
      document.execCommand(cmdMap[alignment]);
      handleInput();
    },
    [handleInput, contentRef],
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      if (!activeNote) return;
      const updated = { ...activeNote, fontSize: size };
      setActiveNote(updated);
      persistNote(updated);
    },
    [activeNote, persistNote, setActiveNote],
  );

  const handleScreenshot = useCallback(async () => {
    if (capturing || !activeTab) return;
    setCapturing(true);
    try {
      const cssFontName = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-caveat")
        .trim();
      const fontFamily = cssFontName || "Caveat";
      await ensureFontLoaded(fontFamily, fontSize);
      const actualWidth = noteWrapperRef.current?.offsetWidth ?? 680;
      const canvas = drawNoteCanvas(activeTab.html, fontSize, fontFamily, actualWidth);
      canvas.toBlob((blob) => {
        if (!blob) { setCapturing(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeNote?.title ?? "note"}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setCapturing(false);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setCapturing(false);
    }
  }, [capturing, activeTab, fontSize, activeNote]);

  const handleTabCommit = useCallback(async () => {
    if (editingTabId) await commitTabTitle(editingTabId, tabDraft);
    setEditingTabId(null);
  }, [editingTabId, tabDraft, commitTabTitle]);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2Icon className="w-5 h-5 animate-spin" style={{ color: "#333" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .scribble-content * { font-family: var(--font-caveat), cursive !important; }
        .scribble-content strong { font-weight: 700; }
        .scribble-content em { font-style: italic; }
        .scribble-content u { text-decoration: underline; }
        .scribble-content s { text-decoration: line-through; }
        .scribble-content font { font-family: var(--font-caveat), cursive !important; }
        .note-tab { font-family: var(--font-caveat), cursive; }
      `}</style>

      {showShare && activeNote && activeTab && (
        <NotesSharePanel
          noteTitle={activeNote.title}
          noteHtml={activeTab.html}
          noteFontSize={fontSize}
          onClose={() => setShowShare(false)}
        />
      )}

      <div
        className="flex-1 flex flex-col items-center overflow-hidden h-full"
        style={{
          padding: expanded ? "12px 16px" : "16px 16px",
          transition: "padding 0.3s ease",
        }}
      >
        <div
          ref={noteWrapperRef}
          className="flex flex-col w-full flex-1 min-h-0"
          style={{
            maxWidth: expanded ? "100%" : 680,
            filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.7))",
            transition: "max-width 0.3s ease",
          }}
        >
          <NoteToolbar
            onColor={applyColor}
            onHighlight={applyHighlight}
            onFormat={execFormat}
            onAlign={applyAlign}
            fontSize={fontSize}
            onSizeChange={handleSizeChange}
            onScreenshot={handleScreenshot}
            onShare={() => setShowShare(true)}
            capturing={capturing}
            expanded={expanded}
            onToggleExpand={toggleExpanded}
            mobileMenuButton={
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded transition-all cursor-pointer md:hidden"
                style={{ color: "#666" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ddd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                title="Notes list"
              >
                <MenuIcon className="w-4 h-4" />
              </button>
            }
          />

          <div
            className="relative overflow-hidden flex-1 min-h-0"
            style={{
              background: "#fdf9f0",
              clipPath: TORN_BOTTOM,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: HEADER_H,
                background: "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)",
                borderBottom: "2px solid #d4c9a8",
                zIndex: 2,
              }}
            />

            <div
              className="absolute top-0 left-14 right-0 flex items-end gap-0.5 px-2 pointer-events-auto"
              style={{ zIndex: 3, height: HEADER_H }}
            >
              {activeNote?.tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => {
                    if (editingTabId === tab.id) return;
                    if (contentRef.current && activeTab && activeNote) {
                      const html = contentRef.current.innerHTML;
                      const updatedTabs = activeNote.tabs.map((t) =>
                        t.id === activeTabId ? { ...t, html } : t,
                      );
                      persistNote({ ...activeNote, tabs: updatedTabs, activeTabId: tab.id });
                    }
                    setActiveTabId(tab.id);
                  }}
                  className="note-tab group flex items-center gap-1 px-3 cursor-pointer transition-all select-none"
                  style={{
                    height: 34,
                    marginTop: "auto",
                    borderRadius: "5px 5px 0 0",
                    background: tab.id === activeTabId ? "#fdf9f0" : "rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: tab.id === activeTabId ? "#d4c9a8" : "transparent",
                    borderBottom: tab.id === activeTabId ? "2px solid #fdf9f0" : "none",
                    fontSize: 15,
                    color: tab.id === activeTabId ? "#1a1a2e" : "#9a8f80",
                    minWidth: 56,
                    maxWidth: 110,
                  }}
                >
                  {editingTabId === tab.id ? (
                    <input
                      ref={tabInputRef}
                      value={tabDraft}
                      onChange={(e) => setTabDraft(e.target.value)}
                      onBlur={handleTabCommit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTabCommit();
                        if (e.key === "Escape") setEditingTabId(null);
                      }}
                      className="bg-transparent outline-none w-full note-tab"
                      style={{ fontSize: 15, color: "#1a1a2e" }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="truncate flex-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(tab.id);
                        setTabDraft(tab.title);
                      }}
                    >
                      {tab.title}
                    </span>
                  )}
                  {activeNote!.tabs.length > 1 && (
                    <button
                      onClick={(e) => removeTab(tab.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                      style={{ color: "#aaa" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#e55")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addTab}
                className="flex items-center justify-center transition-colors"
                style={{
                  width: 26,
                  height: 26,
                  marginTop: "auto",
                  marginBottom: 4,
                  borderRadius: 4,
                  color: "#888",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="absolute top-0 bottom-0 left-0 w-14 flex flex-col items-center pointer-events-none z-10"
              style={{ paddingTop: HEADER_H + lineHeight }}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    background: "#1a1410",
                    marginBottom: `${lineHeight * 4 - 16}px`,
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.1)",
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
              className="scribble-content absolute inset-0 outline-none overflow-y-auto"
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
                caretColor: "#1a1a2e",
                wordBreak: "break-word",
                zIndex: 1,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}