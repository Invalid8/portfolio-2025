"use client";

import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { cn } from "@/lib/utils";
import {
  CameraIcon,
  EditIcon,
  Loader2Icon,
  SaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import { domToPng } from "modern-screenshot";

function Toolkit() {
  const { isEditing, toggleEdit, isAdmin } = useAuth();
  const { hasUnsavedChanges, saveAll } = usePageContext();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
        features: {
          restoreScrollPosition: true,
          fixSvgXmlDecode: true,
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

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveAll();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <menu
      ref={toolbarRef}
      className={cn(
        "flex justify-center items-center fixed bottom-8 z-9999999 transition-all duration-300",
        isMinimized ? "left-0" : "left-0 right-0",
      )}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="ml-8 p-3 bg-white/3 backdrop-blur-lg border-2 border-primary rounded-full hover:bg-white/5 transition-colors"
          title="Expand Toolkit"
        >
          <ChevronRightIcon className="text-primary" />
        </button>
      ) : (
        <nav className="h-16 rounded-full bg-white/3 backdrop-blur-lg border-2 border-primary px-2 py-4 max-w-sm flex items-center gap-3 justify-center">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij"
            title="Minimize"
          >
            <ChevronLeftIcon />
          </button>

          <span className="h-6 w-0.5 bg-primary/30"></span>

          <button
            onClick={toggleEdit}
            title="Edit Portfolio"
            aria-label="Edit Portfolio"
            disabled={isCapturing}
            className={cn(
              "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij relative",
              isEditing && "bg-primary text-white",
              isCapturing && "opacity-50 cursor-not-allowed",
            )}
          >
            <EditIcon />
          </button>

          {isAdmin && hasUnsavedChanges && (
            <>
              <span className="h-6 w-0.5 bg-primary/30"></span>
              <button
                onClick={handleSave}
                title="Save Changes"
                aria-label="Save Changes"
                disabled={isSaving || isCapturing}
                className={cn(
                  "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij relative",
                  isSaving && "opacity-50 cursor-not-allowed",
                )}
              >
                {isSaving ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <>
                    <SaveIcon />
                  </>
                )}
              </button>
            </>
          )}

          <span className="h-6 w-0.5 bg-primary/30"></span>

          <button
            onClick={takeScreenShot}
            title="Take Screenshot"
            aria-label="Take Screenshot"
            disabled={isCapturing}
            className={cn(
              "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij",
              isCapturing && "opacity-50 cursor-not-allowed",
            )}
          >
            {isCapturing ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CameraIcon />
            )}
          </button>
        </nav>
      )}
    </menu>
  );
}

export default Toolkit;
