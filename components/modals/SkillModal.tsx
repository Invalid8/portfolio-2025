"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../customs/ImageUpload";
import { Skill } from "@/types";

interface AddSkillModalProps {
  onAdd: (skill: Partial<Skill>) => Promise<void>;
}

export function AddSkillModal({ onAdd }: AddSkillModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    file: File | null;
  }>({
    url: "",
    file: null,
  });
  const [formData, setFormData] = useState({
    value: "",
    skillLevel: 50,
    description: "",
    color: "#EC4899",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        ...formData,
        img: imageData.url,
        key: formData.value.toLowerCase().replace(/\s+/g, "-"),
      });

      setOpen(false);
      setFormData({
        value: "",
        skillLevel: 50,
        description: "",
        color: "#EC4899",
      });
      setImageData({ url: "", file: null });
    } catch (error) {
      console.error("Failed to add skill:", error);
      toast.error("Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 md:px-8 px-6 py-4 bg-primary/10 backdrop-blur border border-primary/30 rounded-full hover:bg-primary/20 transition-all"
      >
        <PlusIcon className="w-5 h-5 text-primary" />
        <span className="font-medium text-primary flex gap-2 items-center">
          Add <span className="hidden lg:block">New Skill</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-700 z-999">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Skill
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              value={imageData.url}
              onChange={(url, file) =>
                setImageData({ url, file: file ?? null })
              }
              label="Skill Icon (optional)"
              placeholder="https://example.com/icon.svg"
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Skill Name *
              </label>
              <Input
                required
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="e.g., React, TypeScript"
                className="bg-neutral-800/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Proficiency Level: {formData.skillLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.skillLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillLevel: parseInt(e.target.value),
                  })
                }
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (optional)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the skill"
                rows={2}
                className="bg-neutral-800/50"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Skill"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditSkillModalProps {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string | number, data: Partial<Skill>) => Promise<void>;
}

export function EditSkillModal({
  skill,
  open,
  onOpenChange,
  onUpdate,
}: EditSkillModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    file: File | null;
  }>({
    url: "",
    file: null,
  });
  const [formData, setFormData] = useState({
    value: "",
    skillLevel: 50,
    description: "",
    color: "#EC4899",
  });

  useEffect(() => {
    if (skill) {
      setFormData({
        value: skill.value || "",
        skillLevel: skill.skillLevel || 50,
        description: skill.description || "",
        color: skill.color || "#EC4899",
      });
      setImageData({ url: skill.img || "", file: null });
    }
  }, [skill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skill) return;

    setLoading(true);

    try {
      await onUpdate(skill.id, {
        ...formData,
        img: imageData.url,
        key: formData.value.toLowerCase().replace(/\s+/g, "-"),
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update skill:", error);
      toast.error("Failed to update skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-700 z-999">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Skill</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            value={imageData.url}
            onChange={(url, file) => setImageData({ url, file: file ?? null })}
            label="Skill Icon (optional)"
            placeholder="https://example.com/icon.svg"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Skill Name *
            </label>
            <Input
              required
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder="e.g., React, TypeScript"
              className="bg-neutral-800/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Proficiency Level: {formData.skillLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.skillLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skillLevel: parseInt(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the skill"
              rows={2}
              className="bg-neutral-800/50"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Skill"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
