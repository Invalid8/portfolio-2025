"use client";

import { useState } from "react";
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

interface AddProjectModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (project: any) => Promise<void>;
}

export function AddProjectModal({ onAdd }: AddProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "challenge",
    role: "Frontend Developer",
    link: "",
    github: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        ...formData,
        thumbnail: "/images/placeholder.png",
        medias: [],
        date: new Date().toISOString(),
        content: "",
      });

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "challenge",
        role: "Frontend Developer",
        link: "",
        github: "",
      });
    } catch (error) {
      console.error("Failed to add project:", error);
      toast.error("Failed to add project");
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
          Add <span className="hidden lg:block">New Project</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Project Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-lg focus:border-primary focus:outline-none"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="challenge">Challenge</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="hackathon">Hackathon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Input
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Your role"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Live Link (optional)
              </label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                GitHub Link (optional)
              </label>
              <Input
                type="url"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/username/repo"
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
                  "Add Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AddSkillModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (skill: any) => Promise<void>;
}

export function AddSkillModal({ onAdd }: AddSkillModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    skillLevel: 50,
    description: "",
    img: "",
    color: "#EC4899",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        ...formData,
        key: formData.value.toLowerCase().replace(/\s+/g, "-"),
      });

      setOpen(false);
      setFormData({
        value: "",
        skillLevel: 50,
        description: "",
        img: "",
        color: "#EC4899",
      });
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Skill Name
              </label>
              <Input
                required
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="e.g., React, TypeScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Proficiency Level ({formData.skillLevel}%)
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
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the skill"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Icon URL (optional)
              </label>
              <Input
                type="url"
                value={formData.img}
                onChange={(e) =>
                  setFormData({ ...formData, img: e.target.value })
                }
                placeholder="https://example.com/icon.svg"
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

interface AddExperienceModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (experience: any) => Promise<void>;
}

export function AddExperienceModal({ onAdd }: AddExperienceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    duration: "",
    companyName: "",
    companyLocation: "",
    companyLink: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        position: {
          title: formData.title,
          role: formData.role,
          duration: formData.duration,
        },
        company: {
          name: formData.companyName,
          location: formData.companyLocation,
          link: formData.companyLink,
          logo: "",
        },
        skills: [],
      });

      setOpen(false);
      setFormData({
        title: "",
        role: "",
        duration: "",
        companyName: "",
        companyLocation: "",
        companyLink: "",
      });
    } catch (error) {
      console.error("Failed to add experience:", error);
      toast.error("Failed to add experience");
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
          Add <span className="hidden lg:block">New Experience</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Experience</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Title
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Role Description
              </label>
              <Textarea
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="Describe your role and responsibilities"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Jan 2023 - Present"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name
              </label>
              <Input
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Company Inc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  value={formData.companyLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyLocation: e.target.value,
                    })
                  }
                  placeholder="Remote / City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.companyLink}
                  onChange={(e) =>
                    setFormData({ ...formData, companyLink: e.target.value })
                  }
                  placeholder="https://company.com"
                />
              </div>
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
                  "Add Experience"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
