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
} from "lucide-react";
import { useNotesAuth } from "@/lib/context/notes-auth";

type ShareEntry = {
  shareId: string;
  title: string;
  createdAt: string | null;
};

type Props = {
  noteTitle: string;
  noteHtml: string;
  noteFontSize: number;
  onClose: () => void;
};

function shareUrl(shareId: string) {
  return `${window.location.origin}/notes/shared/${shareId}`;
}

export default function NotesSharePanel({
  noteTitle,
  noteHtml,
  noteFontSize,
  onClose,
}: Props) {
  const { user, loading, signIn, signOut, getToken } = useNotesAuth();
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [remaining, setRemaining] = useState<number>(10);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newShareId, setNewShareId] = useState<string | null>(null);
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
      setRemaining(data.remaining ?? 10);
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
      if (!res.ok) {
        setError("Failed to delete share");
        return;
      }
      if (newShareId === shareId) setNewShareId(null);
      await fetchShares();
    } catch {
      setError("Failed to delete share");
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 480,
          background: "#111109",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          maxHeight: "85vh",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <ShareIcon className="w-4 h-4" style={{ color: "#e85d26" }} />
            <span className="font-medium text-sm" style={{ color: "#ddd" }}>
              Share Note
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ color: "#555" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="w-5 h-5 animate-spin" style={{ color: "#555" }} />
            </div>
          ) : !user ? (
            <div className="text-center space-y-4 py-6">
              <p className="text-sm" style={{ color: "#666" }}>
                Sign in with Google to share your notes publicly.
                <br />
                Your local notes are never uploaded without your action.
              </p>
              <button
                onClick={signIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ddd",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#e85d26")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
                }
              >
                <LogInIcon className="w-4 h-4" />
                Sign in with Google
              </button>
            </div>
          ) : (
            <>
              {newShareId && (
                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    background: "rgba(232,93,38,0.08)",
                    border: "1px solid rgba(232,93,38,0.2)",
                  }}
                >
                  <p className="text-xs" style={{ color: "#e85d26" }}>
                    Note shared! Copy the link below:
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex-1 text-xs font-mono truncate"
                      style={{ color: "#aaa" }}
                    >
                      {shareUrl(newShareId)}
                    </span>
                    <button
                      onClick={() => handleCopy(newShareId)}
                      className="p-1.5 rounded-lg transition-colors shrink-0"
                      style={{ color: copiedId === newShareId ? "#4ade80" : "#888" }}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "#444" }}>
                    Share current note
                  </span>
                  <span className="text-xs" style={{ color: remaining <= 2 ? "#ef4444" : "#555" }}>
                    {remaining} slot{remaining !== 1 ? "s" : ""} remaining
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  disabled={sharing || remaining <= 0}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: remaining <= 0 ? "#1a1a1a" : "rgba(232,93,38,0.15)",
                    border: `1px solid ${remaining <= 0 ? "rgba(255,255,255,0.05)" : "rgba(232,93,38,0.3)"}`,
                    color: remaining <= 0 ? "#444" : "#e85d26",
                    cursor: remaining <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {sharing ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShareIcon className="w-4 h-4" />
                  )}
                  {remaining <= 0 ? "Limit reached — delete a share first" : "Share this snapshot"}
                </button>
                <p className="text-xs" style={{ color: "#444" }}>
                  Shares are snapshots — edits to your local note won&apos;t update the shared link.
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <div
                className="pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#444" }}>
                  My Shares
                </p>

                {loadingShares ? (
                  <div className="flex justify-center py-4">
                    <Loader2Icon className="w-4 h-4 animate-spin" style={{ color: "#555" }} />
                  </div>
                ) : shares.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "#444" }}>
                    No shares yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shares.map((s) => (
                      <div
                        key={s.shareId}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: "#0e0c0a",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: "#ccc" }}>
                            {s.title}
                          </p>
                          {s.createdAt && (
                            <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                              {new Date(s.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(s.shareId)}
                          className="p-1.5 rounded-lg transition-colors shrink-0"
                          style={{ color: copiedId === s.shareId ? "#4ade80" : "#555" }}
                          onMouseEnter={(e) => {
                            if (copiedId !== s.shareId)
                              e.currentTarget.style.color = "#aaa";
                          }}
                          onMouseLeave={(e) => {
                            if (copiedId !== s.shareId)
                              e.currentTarget.style.color = "#555";
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
                          className="p-1.5 rounded-lg transition-colors shrink-0"
                          style={{ color: "#555" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef4444")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#555")
                          }
                          title="Delete share"
                        >
                          {deletingId === s.shareId ? (
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs" style={{ color: "#444" }}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "#555" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                >
                  <LogOutIcon className="w-3 h-3" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}