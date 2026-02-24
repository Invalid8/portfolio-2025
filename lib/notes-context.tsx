"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Note,
  type NoteTab,
  getAllNotes,
  saveNote,
  deleteNote,
  makeId,
  makeNewNote,
  slugify,
} from "@/lib/notes-db";
import { DISCLAIMER_KEY } from "@/lib/notes-canvas";

type NotesCtx = {
  notes: Note[];
  activeNote: Note | null;
  activeTabId: string;
  loaded: boolean;
  showDisclaimer: boolean;
  expanded: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  dismissDisclaimer: () => void;
  toggleExpanded: () => void;
  persistNote: (note: Note) => Promise<Note>;
  selectNote: (note: Note) => void;
  addNote: () => Promise<void>;
  removeNote: (id: string, e: React.MouseEvent) => Promise<void>;
  addTab: () => Promise<void>;
  removeTab: (tabId: string, e: React.MouseEvent) => Promise<void>;
  setActiveNote: (note: Note) => void;
  setActiveTabId: (id: string) => void;
  commitTitle: (draft: string) => Promise<void>;
  commitTabTitle: (tabId: string, draft: string) => Promise<void>;
};

const Ctx = createContext<NotesCtx | null>(null);

export function useNotes() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(DISCLAIMER_KEY);
    } catch {
      return false;
    }
  });

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const all = await getAllNotes();

      if (all.length === 0) {
        const fresh = makeNewNote("My Notes");
        await saveNote(fresh);
        setNotes([fresh]);
        setActiveNote(fresh);
        setActiveTabId(fresh.activeTabId);
        window.history.replaceState(null, "", `/notes/${fresh.slug}`);
        setLoaded(true);
        return;
      }

      setNotes(all);
      const slug = window.location.pathname.split("/notes/")[1]?.split("/")[0];
      const target = slug
        ? (all.find((n) => n.slug === slug) ?? all[0])
        : all[0];
      setActiveNote(target);
      setActiveTabId(target.activeTabId);
      window.history.replaceState(null, "", `/notes/${target.slug}`);
      setLoaded(true);
    })();
  }, []);

  const dismissDisclaimer = useCallback(() => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, "1");
    } catch {}
    setShowDisclaimer(false);
  }, []);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const persistNote = useCallback(async (note: Note): Promise<Note> => {
    const updated = { ...note, updatedAt: Date.now() };
    await saveNote(updated);
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === updated.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
    return updated;
  }, []);

  const selectNote = useCallback(
    (note: Note) => {
      if (contentRef.current && activeNote) {
        const html = contentRef.current.innerHTML;
        const updatedTabs = activeNote.tabs.map((t) =>
          t.id === activeTabId ? { ...t, html } : t,
        );
        persistNote({ ...activeNote, tabs: updatedTabs });
      }
      setActiveNote(note);
      setActiveTabId(note.activeTabId);
      window.history.replaceState(null, "", `/notes/${note.slug}`);
    },
    [activeNote, activeTabId, persistNote],
  );

  const addNote = useCallback(async () => {
    const fresh = makeNewNote("Untitled");
    await saveNote(fresh);
    setNotes((prev) => [fresh, ...prev]);
    setActiveNote(fresh);
    setActiveTabId(fresh.activeTabId);
    window.history.replaceState(null, "", `/notes/${fresh.slug}`);
  }, []);

  const removeNote = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteNote(id);
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== id);
        if (activeNote?.id === id) {
          if (remaining.length > 0) {
            setActiveNote(remaining[0]);
            setActiveTabId(remaining[0].activeTabId);
            window.history.replaceState(
              null,
              "",
              `/notes/${remaining[0].slug}`,
            );
          } else {
            (async () => {
              const fresh = makeNewNote("My Notes");
              await saveNote(fresh);
              setNotes([fresh]);
              setActiveNote(fresh);
              setActiveTabId(fresh.activeTabId);
              window.history.replaceState(null, "", `/notes/${fresh.slug}`);
            })();
            return [];
          }
        }
        return remaining;
      });
    },
    [activeNote],
  );

  const addTab = useCallback(async () => {
    if (!activeNote) return;
    const newTab: NoteTab = {
      id: makeId(),
      title: `Page ${activeNote.tabs.length + 1}`,
      html: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = {
      ...activeNote,
      tabs: [...activeNote.tabs, newTab],
      activeTabId: newTab.id,
    };
    setActiveNote(updated);
    setActiveTabId(newTab.id);
    await persistNote(updated);
  }, [activeNote, persistNote]);

  const removeTab = useCallback(
    async (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!activeNote || activeNote.tabs.length === 1) return;
      const remaining = activeNote.tabs.filter((t) => t.id !== tabId);
      const newActive =
        activeTabId === tabId
          ? remaining[remaining.length - 1].id
          : activeTabId;
      const updated = {
        ...activeNote,
        tabs: remaining,
        activeTabId: newActive,
      };
      setActiveNote(updated);
      setActiveTabId(newActive);
      await persistNote(updated);
    },
    [activeNote, activeTabId, persistNote],
  );

  const commitTitle = useCallback(
    async (draft: string) => {
      if (!activeNote || !draft.trim()) return;
      const newSlug = slugify(draft) + "-" + activeNote.slug.split("-").pop();
      const updated = { ...activeNote, title: draft.trim(), slug: newSlug };
      setActiveNote(updated);
      await persistNote(updated);
      window.history.replaceState(null, "", `/notes/${newSlug}`);
    },
    [activeNote, persistNote],
  );

  const commitTabTitle = useCallback(
    async (tabId: string, draft: string) => {
      if (!activeNote) return;
      const updatedTabs = activeNote.tabs.map((t) =>
        t.id === tabId ? { ...t, title: draft.trim() || t.title } : t,
      );
      const updated = { ...activeNote, tabs: updatedTabs };
      setActiveNote(updated);
      await persistNote(updated);
    },
    [activeNote, persistNote],
  );

  return (
    <Ctx.Provider
      value={{
        notes,
        activeNote,
        activeTabId,
        loaded,
        showDisclaimer,
        expanded,
        contentRef,
        dismissDisclaimer,
        toggleExpanded,
        persistNote,
        selectNote,
        addNote,
        removeNote,
        addTab,
        removeTab,
        setActiveNote,
        setActiveTabId,
        commitTitle,
        commitTabTitle,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}