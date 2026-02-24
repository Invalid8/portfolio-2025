"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  NotebookPenIcon,
  PanelLeftClose,
  PanelLeftOpen,
  XIcon,
} from "lucide-react";
import { useNotes } from "@/lib/context/notes-context";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function htmlToPreview(html: string): string {
  if (typeof document === "undefined") return "";
  const div = document.createElement("div");
  div.innerHTML = html.replace(/<br\s*\/?>/gi, " ");
  return (div.innerText || div.textContent || "").trim().slice(0, 100);
}

export default function NotesSidebar() {
  const {
    notes,
    activeNote,
    addNote,
    removeNote,
    selectNote,
    commitTitle,
    showMobileSidebar,
    toggleMobileSidebar,
  } = useNotes();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  async function handleCommit() {
    if (titleDraft.trim()) await commitTitle(titleDraft);
    setEditingTitle(false);
  }

  const sidebarContent = (
    <>
      <div
        className={`flex items-center border-b border-white/5 px-4 py-5 ${collapsed ? "justify-center" : "gap-3"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <NotebookPenIcon size={20} className="text-zinc-500 shrink-0" />

            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={titleInputRef}
                  className="w-full bg-transparent border-b border-primary text-base outline-none"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleCommit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommit();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                />
                <button onClick={handleCommit} className="text-primary hover:opacity-80">
                  <CheckIcon size={18} />
                </button>
              </div>
            ) : (
              <button
                className="text-lg font-semibold text-zinc-200 truncate hover:text-white transition text-left"
                onClick={() => {
                  setTitleDraft(activeNote?.title ?? "");
                  setEditingTitle(true);
                }}
              >
                {activeNote?.title ?? "Untitled"}
              </button>
            )}
          </div>
        )}

        {!collapsed && (
          <button
            onClick={addNote}
            className="p-2.5 rounded-lg hover:bg-white/5 transition shrink-0"
            title="New note"
          >
            <PlusIcon size={18} />
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-lg hover:bg-white/5 transition hidden md:flex"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <button
          onClick={toggleMobileSidebar}
          className="p-2.5 rounded-lg hover:bg-white/5 transition md:hidden"
        >
          <XIcon size={20} />
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto py-4 ${collapsed ? "flex flex-col items-center gap-5" : "px-3 space-y-3"}`}
      >
        {notes.map((note) => {
          const isActive = note.id === activeNote?.id;
          const preview = htmlToPreview(note.tabs[0]?.html ?? "");

          return (
            <button
              key={note.id}
              onClick={() => selectNote(note)}
              className={`group relative rounded-xl transition-all duration-200 ${
                collapsed
                  ? "w-11 h-11 flex items-center justify-center"
                  : "w-full text-left px-4 py-4"
              } ${isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5"}`}
            >
              {collapsed ? (
                <div
                  className={`w-3 h-3 rounded-full transition-all ${isActive ? "bg-primary scale-110" : "bg-zinc-600"}`}
                />
              ) : (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r" />
                  )}

                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-base font-medium truncate ${isActive ? "text-white" : "text-zinc-300"}`}>
                      {note.title}
                    </span>
                    <div
                      onClick={(e) => removeNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-red-500 shrink-0"
                    >
                      <TrashIcon size={16} />
                    </div>
                  </div>

                  <p className="text-sm text-zinc-500 truncate mt-2">
                    {preview || "Write something..."}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-zinc-600">
                    <span>{note.tabs.length === 1 ? "1 page" : `${note.tabs.length} pages`}</span>
                    <span>•</span>
                    <span>{timeAgo(note.updatedAt)}</span>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`h-full flex-col border-r border-white/5 bg-[#0e0c0a]/70 backdrop-blur-xl transition-all duration-300 ease-in-out hidden md:flex ${collapsed ? "w-16 items-center" : "w-80"}`}
      >
        {sidebarContent}
      </aside>

      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={toggleMobileSidebar}
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-80 flex flex-col border-r border-white/5 bg-[#0e0c0a] backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}