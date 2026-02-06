"use client";

import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { cn } from "@/lib/utils";
import {
  EditIcon,
  Loader2Icon,
  SaveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

function Toolkit() {
  const { isEditing, toggleEdit, isAdmin } = useAuth();
  const { hasUnsavedChanges, saveAll } = usePageContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const toolbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("toolkit-minimized");
    if (stored !== null) {
      setIsMinimized(stored === "true");
    }
  }, []);

  const handleMinimize = (value: boolean) => {
    setIsMinimized(value);
    localStorage.setItem("toolkit-minimized", String(value));
  };

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveAll();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save changes");
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
          onClick={() => handleMinimize(false)}
          className="ml-8 p-3 bg-white/3 backdrop-blur-lg border-2 border-primary rounded-full hover:bg-white/5 transition-colors"
          title="Expand Toolkit"
        >
          <ChevronRightIcon className="text-primary" />
        </button>
      ) : (
        <nav className="h-16 rounded-full bg-white/3 backdrop-blur-lg border-2 border-primary px-2 py-4 max-w-sm flex items-center gap-3 justify-center">
          <button
            onClick={() => handleMinimize(true)}
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
            className={cn(
              "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij relative",
              isEditing && "bg-primary text-white",
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
                disabled={isSaving}
                className={cn(
                  "p-3 text-primary cursor-pointer hover:bg-white/4 transition-colors rounded-full size-12 min-w-8 fij relative",
                  isSaving && "opacity-50 cursor-not-allowed",
                )}
              >
                {isSaving ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SaveIcon />
                )}
              </button>
            </>
          )}
        </nav>
      )}
    </menu>
  );
}

export default Toolkit;
