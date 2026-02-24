import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/server/admin";
import SharedNoteView from "./SharedNoteView";

async function getSharedNote(shareId: string) {
  try {
    const snap = await db.collection("shared-notes").doc(shareId).get();
    if (!snap.exists) return null;
    const d = snap.data()!;
    return {
      shareId: snap.id,
      title: d.title as string,
      html: d.html as string,
      fontSize: d.fontSize as number,
      ownerEmail: d.ownerEmail as string,
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  } catch {
    return null;
  }
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const note = await getSharedNote(shareId);

  if (!note) {
    return { title: "Note Not Found" };
  }

  const description = htmlToPlainText(note.html) || "A shared scribble note.";

  return {
    title: note.title,
    description,
    openGraph: {
      title: note.title,
      description,
      type: "article",
      images: [
        {
          url: "/images/note-og.png",
          width: 1200,
          height: 630,
          alt: note.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description,
      images: ["/images/note-og.png"],
    },
  };
}

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const note = await getSharedNote(shareId);

  if (!note) notFound();

  return <SharedNoteView note={note} />;
}
