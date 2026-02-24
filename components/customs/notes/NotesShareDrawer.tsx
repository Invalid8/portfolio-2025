"use client";

import { useState, useEffect, useCallback } from "react";
import {
  XIcon,
  ShareIcon,
  Loader2Icon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  LogInIcon,
  LogOutIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useNotesAuth } from "@/lib/context/notes-auth";
import { TORN_BOTTOM, HEADER_H } from "@/lib/notes-canvas";

type ShareEntry = {
  shareId: string;
  title: string;
  html: string;
  fontSize: number;
  createdAt: string | null;
};

type Props = {
  noteTitle: string;
  noteHtml: string;
  noteFontSize: number;
  onClose: () => void;
};

const MAX_SHARES = 10;

function shareUrl(shareId: string) {
  return `${window.location.origin}/notes/shared/${shareId}`;
}

function NotePreview({ html, fontSize }: { html: string; fontSize: number }) {
  const lh = Math.round(fontSize * 1.72);
  const padTop = HEADER_H + Math.round(lh * 0.5);
  const gridOffset = padTop % lh;

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        background: "#fdf9f0",
        clipPath: TORN_BOTTOM,
        minHeight: 180,
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
        className="absolute top-0 bottom-0 left-0 w-12 flex flex-col items-center pointer-events-none"
        style={{ paddingTop: HEADER_H + lh, zIndex: 3 }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              flexShrink: 0,
              background: "#1a1410",
              marginBottom: `${lh * 4 - 10}px`,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)",
            }}
          />
        ))}
      </div>
      <div
        className="scribble-content pointer-events-none select-none"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily: "var(--font-caveat), cursive",
          color: "#1a1a2e",
          backgroundImage: [
            `repeating-linear-gradient(transparent, transparent ${lh - 1}px, #c8d8e8 ${lh - 1}px, #c8d8e8 ${lh}px)`,
            `linear-gradient(to right, transparent 48px, #e8a0a0 48px, #e8a0a0 50px, transparent 50px)`,
          ].join(", "),
          backgroundPositionY: `${gridOffset}px`,
          fontSize: Math.min(fontSize, 16),
          lineHeight: `${lh}px`,
          paddingTop: `${padTop}px`,
          paddingBottom: 24,
          paddingLeft: 60,
          paddingRight: 16,
          wordBreak: "break-word",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          maxHeight: 240,
        }}
      />
      <style>{`.scribble-content * { font-family: var(--font-caveat), cursive !important; }`}</style>
    </div>
  );
}

export default function NotesShareDrawer({
  noteTitle,
  noteHtml,
  noteFontSize,
  onClose,
}: Props) {
  const { user, loading, signIn, signOut, getToken } = useNotesAuth();
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [remaining, setRemaining] = useState(MAX_SHARES);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newShareId, setNewShareId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  const fetchShares = useCallback(async () => {
    if (!user) return;
    setLoadingShares(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/notes/share", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShares(data.shares ?? []);
      setRemaining(data.remaining ?? MAX_SHARES);
    } catch {
      setError("Failed to load shares");
    } finally {
      setLoadingShares(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (user) fetchShares();
  }, [user, fetchShares]);

  async function handleShare() {
    if (!user) return;
    setSharing(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/notes/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: noteTitle,
          html: noteHtml,
          fontSize: noteFontSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to share");
        return;
      }
      setNewShareId(data.shareId);
      await fetchShares();
    } catch {
      setError("Failed to share note");
    } finally {
      setSharing(false);
    }
  }

  async function handleDelete(shareId: string) {
    setDeletingId(shareId);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/notes/share/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setError("Failed to unshare"); return; }
      if (newShareId === shareId) setNewShareId(null);
      if (expandedId === shareId) setExpandedId(null);
      await fetchShares();
    } catch {
      setError("Failed to unshare");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(shareId: string) {
    await navigator.clipboard.writeText(shareUrl(shareId));
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[998]"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
        onClick={handleClose}
      />

      <div
        className="fixed top-0 left-0 h-full z-[999] flex flex-col"
        style={{
          width: "min(400px, 100vw)",
          background: "#0e0c0a",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <ShareIcon className="w-4 h-4" style={{ color: "#e85d26" }} />
            <span className="text-sm font-medium" style={{ color: "#ddd" }}>
              Share Notes
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{ color: "#444" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="w-5 h-5 animate-spin" style={{ color: "#444" }} />
            </div>
          ) : !user ? (
            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                Sign in with Google to share notes publicly. Your local notes are never uploaded without your action.
              </p>
              <button
                onClick={signIn}
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#ddd",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e85d26")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <LogInIcon className="w-4 h-4" />
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <div
                className="p-5 space-y-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#444" }}>
                    Share this note
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{
                      background: remaining <= 2 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                      color: remaining <= 2 ? "#ef4444" : "#555",
                      border: `1px solid ${remaining <= 2 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    {remaining}/{MAX_SHARES} left
                  </span>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{ background: "#141210", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p className="text-sm truncate mb-1" style={{ color: "#bbb" }}>
                    {noteTitle}
                  </p>
                  <p className="text-xs" style={{ color: "#444" }}>
                    Snapshot — edits won&apos;t update the shared link
                  </p>
                </div>

                {newShareId && (
                  <div
                    className="p-3 rounded-xl space-y-2"
                    style={{
                      background: "rgba(232,93,38,0.06)",
                      border: "1px solid rgba(232,93,38,0.2)",
                    }}
                  >
                    <p className="text-xs" style={{ color: "#e85d26" }}>
                      Shared! Copy the link:
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-xs font-mono truncate" style={{ color: "#888" }}>
                        {shareUrl(newShareId)}
                      </span>
                      <button
                        onClick={() => handleCopy(newShareId)}
                        style={{ color: copiedId === newShareId ? "#4ade80" : "#666" }}
                      >
                        {copiedId === newShareId ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
                )}

                <button
                  onClick={handleShare}
                  disabled={sharing || remaining <= 0}
                  className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: remaining <= 0 ? "#111" : "rgba(232,93,38,0.12)",
                    border: `1px solid ${remaining <= 0 ? "rgba(255,255,255,0.04)" : "rgba(232,93,38,0.25)"}`,
                    color: remaining <= 0 ? "#333" : "#e85d26",
                    cursor: remaining <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {sharing ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShareIcon className="w-4 h-4" />
                  )}
                  {remaining <= 0 ? "Limit reached — unshare something first" : "Share snapshot"}
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#444" }}>
                  My Shared Notes
                </p>

                {loadingShares ? (
                  <div className="flex justify-center py-6">
                    <Loader2Icon className="w-4 h-4 animate-spin" style={{ color: "#444" }} />
                  </div>
                ) : shares.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: "#333" }}>
                    Nothing shared yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shares.map((s) => (
                      <div
                        key={s.shareId}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "#141210",
                          border: `1px solid ${newShareId === s.shareId ? "rgba(232,93,38,0.3)" : "rgba(255,255,255,0.05)"}`,
                        }}
                      >
                        <div className="flex items-center gap-2 px-3 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: "#ccc" }}>
                              {s.title}
                            </p>
                            {s.createdAt && (
                              <p className="text-xs mt-0.5" style={{ color: "#444" }}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedId(expandedId === s.shareId ? null : s.shareId)}
                            style={{ color: "#444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                            title="Preview"
                          >
                            {expandedId === s.shareId ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>

                          <a
                            href={shareUrl(s.shareId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                            title="Open in new tab"
                          >
                            <ExternalLinkIcon className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleCopy(s.shareId)}
                            style={{ color: copiedId === s.shareId ? "#4ade80" : "#444" }}
                            onMouseEnter={(e) => {
                              if (copiedId !== s.shareId) e.currentTarget.style.color = "#aaa";
                            }}
                            onMouseLeave={(e) => {
                              if (copiedId !== s.shareId) e.currentTarget.style.color = "#444";
                            }}
                            title="Copy link"
                          >
                            {copiedId === s.shareId ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <CopyIcon className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(s.shareId)}
                            disabled={deletingId === s.shareId}
                            style={{ color: "#444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                            title="Unshare"
                          >
                            {deletingId === s.shareId ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {expandedId === s.shareId && (
                          <div
                            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            <NotePreview html={s.html} fontSize={s.fontSize} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="px-5 py-4 flex items-center justify-between shrink-0 mt-auto"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs truncate" style={{ color: "#333" }}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-xs transition-colors shrink-0 ml-3"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                >
                  <LogOutIcon className="w-3 h-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}