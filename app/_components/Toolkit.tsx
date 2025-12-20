"use client";
import { useAuth } from "@/lib/context/auth";
import { cn } from "@/lib/utils";
import { CameraIcon, EditIcon, Loader2Icon } from "lucide-react";
import { useState, useRef } from "react";
import { domToPng } from "modern-screenshot";

function Toolkit() {
  const { isEditing, toggleEdit } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const toolbarRef = useRef<HTMLElement>(null);

  async function takeScreenShot() {
    setIsCapturing(true);

    try {
      if (toolbarRef.current) {
        toolbarRef.current.style.display = "none";
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await domToPng(document.documentElement, {
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 2,
        style: {
          margin: "0",
          padding: "0",
          overflow: "hidden",
        },
      });

      if (toolbarRef.current) {
        toolbarRef.current.style.display = "";
      }

      const link = document.createElement("a");
      link.download = `portfolio-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Screenshot failed:", error);
      alert("Failed to capture screenshot");

      if (toolbarRef.current) {
        toolbarRef.current.style.display = "";
      }
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <menu
      ref={toolbarRef}
      className="flex justify-center items-center fixed bottom-8 left-0 right-0 z-999"
    >
      <nav className="h-16 rounded-full bg-white/3 backdrop-blur-lg border-2 border-primary px-2 py-4 max-w-sms flex items-center gap-3 justify-center">
        <button
          onClick={toggleEdit}
          title="Edit Portfolio"
          aria-label="Edit Portfolio"
          disabled={isCapturing}
          className={cn(
            "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij",
            isEditing && "bg-primary text-white",
            isCapturing && "opacity-50 cursor-not-allowed"
          )}
        >
          <EditIcon />
        </button>

        <span className="h-6 w-0.5 bg-primary/30"></span>

        <button
          onClick={takeScreenShot}
          title="Take Screenshot"
          aria-label="Take Screenshot"
          disabled={isCapturing}
          className={cn(
            "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij",
            isCapturing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isCapturing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <CameraIcon />
          )}
        </button>
      </nav>
    </menu>
  );
}

export default Toolkit;
