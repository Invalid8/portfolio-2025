"use client";

import Link from "next/link";
import { TORN_BOTTOM, HEADER_H } from "@/lib/notes-canvas";

type SharedNote = {
  shareId: string;
  title: string;
  html: string;
  fontSize: number;
  ownerEmail: string;
  createdAt: string | null;
};

export default function SharedNoteView({ note }: { note: SharedNote }) {
  const fontSize = note.fontSize ?? 20;
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "#0c0a08" }}
    >
      <div
        className="w-full mb-8"
        style={{
          maxWidth: 680,
          filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.8))",
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: "#fdf9f0",
            clipPath: TORN_BOTTOM,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 flex items-center px-4"
            style={{
              height: HEADER_H,
              background:
                "linear-gradient(180deg, #ede0c4 0%, #f5ecd8 60%, #fdf9f0 100%)",
              borderBottom: "2px solid #d4c9a8",
              zIndex: 2,
              paddingLeft: 80,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-caveat), cursive",
                fontSize: 20,
                color: "#8a7a60",
              }}
            >
              {note.title}
            </span>
          </div>

          <div
            className="absolute top-0 bottom-0 left-0 w-14 flex flex-col items-center pointer-events-none"
            style={{ paddingTop: HEADER_H + lineHeight, zIndex: 10 }}
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
            className="scribble-content"
            dangerouslySetInnerHTML={{ __html: note.html }}
            style={{
              fontFamily: "var(--font-caveat), cursive",
              color: "#1a1a2e",
              ...paperLines,
              fontSize,
              lineHeight: `${lineHeight}px`,
              paddingTop: `${contentPadTop}px`,
              paddingBottom: 60,
              paddingLeft: 76,
              paddingRight: 36,
              wordBreak: "break-word",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      <div className="text-center space-y-3">
        <p style={{ color: "#555", fontSize: 13, fontFamily: "monospace" }}>
          shared by {note.ownerEmail}
          {note.createdAt && (
            <> &middot; {new Date(note.createdAt).toLocaleDateString()}</>
          )}
        </p>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-all"
          style={{
            borderColor: "#2a2a2a",
            color: "#888",
            fontFamily: "monospace",
          }}
        >
          Write your own note →
        </Link>
      </div>

      <style>{`
        .scribble-content * { font-family: var(--font-caveat), cursive !important; }
        .scribble-content strong { font-weight: 700; }
        .scribble-content em { font-style: italic; }
        .scribble-content u { text-decoration: underline; }
        .scribble-content s { text-decoration: line-through; }
      `}</style>
    </div>
  );
}