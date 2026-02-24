"use client";

import { useState, useEffect, useCallback } from "react";
import {
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
  ChevronRightIcon,
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
};

const MAX_SHARES = 10;

function shareUrl(shareId: string) {
  return `${window.location.origin}/notes/shared/${shareId}`;
}

function NotePreview({ html, fontSize }: { html: string; fontSize: number }) {
  const lh = Math.round(Math.min(fontSize, 16) * 1.72);
  const padTop = HEADER_H + Math.round(lh * 0.5);

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        background: "#fdf9f0",
        clipPath: TORN_BOTTOM,
        minHeight: 140,
        maxHeight: 200,
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
        className="scribble-content pointer-events-none select-none"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily: "var(--font-caveat), cursive",
          color: "#1a1a2e",
          backgroundImage: `repeating-linear-gradient(transparent, transparent ${lh - 1}px, #c8d8e8 ${lh - 1}px, #c8d8e8 ${lh}px)`,
          fontSize: Math.min(fontSize, 14),
          lineHeight: `${lh}px`,
          paddingTop: `${padTop}px`,
          paddingBottom: 24,
          paddingLeft: 20,
          paddingRight: 12,
          wordBreak: "break-word",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          maxHeight: 200,
        }}
      />
      <style>{`.scribble-content * { font-family: var(--font-caveat), cursive !important; }`}</style>
    </div>
  );
}

export default function NotesSharePanel({ noteTitle, noteHtml, noteFontSize }: Props) {
  const { user, loading, signIn, signOut, getToken } = useNotesAuth();
  const [open, setOpen] = useState(true);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [remaining, setRemaining] = useState(MAX_SHARES);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newShareId, setNewShareId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ title: noteTitle, html: noteHtml, fontSize: noteFontSize }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to share"); return; }
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
    <aside
      className="h-full flex-shrink-0 flex flex-row"
      style={{
        width: open ? 356 : 36,
        transition: "width 0.28s cubic-bezier(0.16,1,0.3,1)",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
        background: "#0e0c0a",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Toggle tab — always on the left edge of the panel */}
      <button
        onClick={() => setOpen(!open)}
        className="flex-shrink-0 flex flex-col items-center justify-center gap-1 h-full transition-colors"
        style={{
          width: 36,
          borderRight: open ? "1px solid rgba(255,255,255,0.05)" : "none",
          color: "#333",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
        title={open ? "Collapse share panel" : "Expand share panel"}
      >
        <ShareIcon style={{ width: 14, height: 14, color: open ? "#e85d26" : undefined }} />
        <ChevronRightIcon
          style={{
            width: 12,
            height: 12,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.28s ease",
          }}
        />
      </button>

      {/* Panel content — only rendered when open */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          opacity: open ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: open ? "auto" : "none",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <ShareIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "#e85d26" }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "#555" }}>
            Share
          </span>
          {user && (
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono shrink-0"
              style={{
                background: remaining <= 2 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                color: remaining <= 2 ? "#ef4444" : "#444",
                border: `1px solid ${remaining <= 2 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {remaining}/{MAX_SHARES}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2Icon className="w-4 h-4 animate-spin" style={{ color: "#333" }} />
            </div>
          ) : !user ? (
            <div className="p-4 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: "#444" }}>
                Sign in to share notes publicly. Your local notes are never uploaded without your action.
              </p>
              <button
                onClick={signIn}
                className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "#141210",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#888",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e85d26")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
              >
                <LogInIcon className="w-3 h-3" />
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Share CTA */}
              <div className="p-4 space-y-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div
                  className="p-2.5 rounded-lg"
                  style={{ background: "#121008", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p className="text-xs truncate" style={{ color: "#aaa" }}>{noteTitle}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#383838" }}>
                    Snapshot — edits won&apos;t update the link
                  </p>
                </div>

                {newShareId && (
                  <div
                    className="p-2.5 rounded-lg space-y-1.5"
                    style={{
                      background: "rgba(232,93,38,0.06)",
                      border: "1px solid rgba(232,93,38,0.18)",
                    }}
                  >
                    <p className="text-[10px]" style={{ color: "#e85d26" }}>Shared! Copy link:</p>
                    <div className="flex items-center gap-1.5">
                      <span className="flex-1 text-[10px] font-mono truncate" style={{ color: "#666" }}>
                        {shareUrl(newShareId)}
                      </span>
                      <button
                        onClick={() => handleCopy(newShareId)}
                        style={{ color: copiedId === newShareId ? "#4ade80" : "#555" }}
                      >
                        {copiedId === newShareId ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && <p className="text-[10px]" style={{ color: "#ef4444" }}>{error}</p>}

                <button
                  onClick={handleShare}
                  disabled={sharing || remaining <= 0}
                  className="w-full py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: remaining <= 0 ? "#0e0c0a" : "rgba(232,93,38,0.1)",
                    border: `1px solid ${remaining <= 0 ? "rgba(255,255,255,0.03)" : "rgba(232,93,38,0.22)"}`,
                    color: remaining <= 0 ? "#2a2a2a" : "#e85d26",
                    cursor: remaining <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {sharing ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <ShareIcon className="w-3 h-3" />}
                  {remaining <= 0 ? "Limit reached" : "Share snapshot"}
                </button>
              </div>

              {/* Shared list */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#333" }}>
                  My Shares
                </p>

                {loadingShares ? (
                  <div className="flex justify-center py-4">
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" style={{ color: "#333" }} />
                  </div>
                ) : shares.length === 0 ? (
                  <p className="text-[10px] text-center py-4" style={{ color: "#2a2a2a" }}>Nothing shared yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {shares.map((s) => (
                      <div
                        key={s.shareId}
                        className="rounded-lg overflow-hidden"
                        style={{
                          background: "#121008",
                          border: `1px solid ${newShareId === s.shareId ? "rgba(232,93,38,0.25)" : "rgba(255,255,255,0.04)"}`,
                        }}
                      >
                        <div className="flex items-center gap-1 px-2.5 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate" style={{ color: "#bbb" }}>{s.title}</p>
                            {s.createdAt && (
                              <p className="text-[10px]" style={{ color: "#383838" }}>
                                {new Date(s.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedId(expandedId === s.shareId ? null : s.shareId)}
                            style={{ color: "#333" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                            title="Preview"
                          >
                            {expandedId === s.shareId
                              ? <ChevronUpIcon className="w-3.5 h-3.5" />
                              : <ChevronDownIcon className="w-3.5 h-3.5" />}
                          </button>

                          <a
                            href={shareUrl(s.shareId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#333" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                            title="Open"
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleCopy(s.shareId)}
                            style={{ color: copiedId === s.shareId ? "#4ade80" : "#333" }}
                            onMouseEnter={(e) => { if (copiedId !== s.shareId) e.currentTarget.style.color = "#888"; }}
                            onMouseLeave={(e) => { if (copiedId !== s.shareId) e.currentTarget.style.color = "#333"; }}
                            title="Copy link"
                          >
                            {copiedId === s.shareId
                              ? <CheckIcon className="w-3.5 h-3.5" />
                              : <CopyIcon className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDelete(s.shareId)}
                            disabled={deletingId === s.shareId}
                            style={{ color: "#333" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                            title="Unshare"
                          >
                            {deletingId === s.shareId
                              ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                              : <TrashIcon className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {expandedId === s.shareId && (
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                            <NotePreview html={s.html} fontSize={s.fontSize} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {user && (
          <div
            className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="text-[10px] truncate" style={{ color: "#2a2a2a" }}>{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1 text-[10px] shrink-0 ml-2 transition-colors"
              style={{ color: "#333" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              <LogOutIcon className="w-3 h-3" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}