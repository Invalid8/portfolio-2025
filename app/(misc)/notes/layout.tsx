import { type ReactNode } from "react";
import { NotesProvider } from "@/lib/context/notes-context";
import { NotesAuthProvider } from "@/lib/context/notes-auth";
import NotesSidebar from "@/components/customs/notes/NotesSidebar";
import NotesDisclaimerWrapper from "@/components/customs/notes/NotesDisclaimerWrapper";
import Link from "next/link";

export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <NotesAuthProvider>
      <NotesProvider>
        <NotesDisclaimerWrapper />
        <div
          className="flex h-screen overflow-hidden"
          style={{ background: "#0c0a08" }}
        >
          <NotesSidebar />
          <main className="flex-1 overflow-hidden flex flex-col relative min-w-0">
            {children}
            <div className="absolute bottom-4 right-6 font-bold text-sm sm:text-lg pointer-events-none bg-[#0c0a08] p-1.5 px-4 rounded-full">
              <p className="pointer-events-auto">
                built by{" "}
                <Link className="text-primary" href="/">
                  dalgoridim
                </Link>
              </p>
            </div>
          </main>
        </div>
      </NotesProvider>
    </NotesAuthProvider>
  );
}
