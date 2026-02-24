import { type ReactNode } from "react";
import { NotesProvider } from "@/lib/notes-context";
import NotesSidebar from "@/components/customs/notes/NotesSidebar";
import NotesDisclaimerWrapper from "@/components/customs/notes/NotesDisclaimerWrapper";
import Link from "next/link";

export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <NotesProvider>
      <NotesDisclaimerWrapper />
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "#0c0a08" }}
      >
        <NotesSidebar />

        <main className="flex-1 overflow-hidden flex flex-col">
          {children}

          <div className="flex items-end justify-end font-bold text-lg font bold p-6 py-4">
            <p>
              built by{" "}
              <Link className="text-primary" href="/">
                dalgoridim
              </Link>
            </p>
          </div>
        </main>
      </div>
    </NotesProvider>
  );
}
