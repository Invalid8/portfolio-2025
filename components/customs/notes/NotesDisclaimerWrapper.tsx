"use client";

import { useNotes } from "@/lib/context/notes-context";
import NoteDisclaimer from "@/components/customs/notes/NoteDisclaimer";

export default function NotesDisclaimerWrapper() {
  const { showDisclaimer, dismissDisclaimer } = useNotes();
  if (!showDisclaimer) return null;
  return (
    <NoteDisclaimer
      onDismiss={dismissDisclaimer}
      storage="IndexedDB"
      position="top-right"
    />
  );
}