"use client";

import { useNotes } from "@/lib/context/notes-context";
import NotesSharePanel from "@/components/customs/notes/NotesSharePanel";

export default function NotesSharePanelWrapper() {
  const { activeNote } = useNotes();
  const activeTab = activeNote?.tabs.find((t) => t.id === activeNote.activeTabId) ?? null;

  return (
    <NotesSharePanel
      noteTitle={activeNote?.title ?? "Untitled"}
      noteHtml={activeTab?.html ?? ""}
      noteFontSize={activeNote?.fontSize ?? 20}
    />
  );
}