"use client";

import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

type Props = {
  onDismiss: () => void;
  storage?: "localStorage" | "IndexedDB";
  position?: "bottom-right" | "top-right";
};

export default function NoteDisclaimer({
  onDismiss,
  storage = "localStorage",
  position = "bottom-right",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const posStyle: React.CSSProperties =
    position === "bottom-right"
      ? { bottom: 24, right: 24 }
      : { top: 24, right: 24 };

  return (
    <div
      className="fixed z-[9999] flex items-start gap-3 px-4 py-3 rounded-xl max-w-md w-full"
      style={{
        ...posStyle,
        background: "rgba(20,18,16,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-base leading-relaxed" style={{ color: "#999" }}>
          Your notes stays on your device, they are saved in your browser {storage}.
        </p>
        <p className="text-base mt-2" style={{ color: "#999" }}>
          <span style={{ color: "#999" }}>You want Evidence?</span> just trust me bro 🙂.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 mt-0 transition-colors"
        style={{ color: "#3a3a3a" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#777")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
      >
        <XIcon className="w-7 h-7" />
      </button>
    </div>
  );
}