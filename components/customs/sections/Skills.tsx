"use client";

import { useState, useEffect } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { Skill, Section } from "@/types";
import { AddSkillModal, EditSkillModal } from "@/components/modals";
import { EmptyState } from "@/components/customs/EmptyState";
import { PlusIcon, Trash2Icon, Edit2Icon, CodeIcon } from "lucide-react";
import { toast } from "sonner";

function isSkill(section: Section): section is Section & Skill {
  return (
    section &&
    typeof section === "object" &&
    "key" in section &&
    "value" in section &&
    "skillLevel" in section &&
    "img" in section
  );
}

export default function SkillsSection() {
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const skillsCollection = sections["skills"] || {};
    const skillList = Object.values(skillsCollection)
      .filter(isSkill)
      .sort((a, b) => b.skillLevel - a.skillLevel);
    setSkills(skillList);
    setLoading(false);
  }, [sections]);

  const handleAddSkill = async (skillData: Partial<Skill>) => {
    try {
      const res = await fetch("/api/admin/firebase/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      if (!res.ok) throw new Error("Failed to add skill");
      const newSkill: Skill = await res.json();
      setSection("skills", `skill-${newSkill.id}`, {
        ...newSkill,
        collection: "skills",
        id: String(newSkill.id),
      });
      toast.success("Skill added!");
    } catch (err) {
      toast.error("Failed to add skill");
      throw err;
    }
  };

  const handleEditSkill = async (
    skillId: string | number,
    skillData: Partial<Skill>,
  ) => {
    try {
      const res = await fetch(`/api/admin/firebase/skills/${skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });
      if (!res.ok) throw new Error("Failed to update skill");
      setSection("skills", `skill-${skillId}`, {
        ...skillData,
        collection: "skills",
        id: String(skillId),
      });
      toast.success("Skill updated!");
    } catch (err) {
      toast.error("Failed to update skill");
      throw err;
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/admin/firebase/skills/${skillId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete skill");
      setSection("skills", `skill-${skillId}`, {} as Section);
      toast.success("Skill deleted!");
    } catch {
      toast.error("Failed to delete skill");
    }
  };

  const displayed = showAll ? skills : skills.slice(0, 12);

  if (loading) {
    return (
      <div
        id="Skills"
        className="min-h-svh w-full flex justify-center items-center"
      >
        <div className="animate-pulse text-2xl">Loading skills...</div>
      </div>
    );
  }

  return (
    <section
      id="Skills"
      className="relative w-full py-24 px-4 sm:px-8 md:px-12 xl:px-20 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(64.66% 0.19548 40.184 / 0.05) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-primary text-xs font-mono tracking-[0.35em] uppercase">
                Stack
              </span>
            </div>
            <ContentSpan
              as="h2"
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-none tracking-tight"
              sectionKey="skills-header"
              fieldKey="title"
            >
              SKILLS &<br />
              TECHNOLOGIES
            </ContentSpan>
            <ContentSpan
              as="p"
              className="text-base text-neutral-400 max-w-xl mt-3"
              sectionKey="skills-header"
              fieldKey="subtitle"
            >
              Technologies and tools I use to build exceptional digital
              experiences.
            </ContentSpan>
          </div>
          {isAdmin && isEditing && <AddSkillModal onAdd={handleAddSkill} />}
        </div>

        {skills.length === 0 ? (
          <EmptyState
            title="No Skills Yet"
            description="Showcase your technical expertise by adding your skills."
            icon={
              <CodeIcon
                className="w-16 h-16 text-neutral-600"
                strokeWidth={1.5}
              />
            }
            action={
              isAdmin && isEditing ? (
                <AddSkillModal onAdd={handleAddSkill} />
              ) : null
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {displayed.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isEditing={isEditing}
                  isAdmin={isAdmin}
                  onEdit={() => setEditingSkill(skill)}
                  onDelete={() => handleDeleteSkill(String(skill.id))}
                />
              ))}
            </div>

            {skills.length > 12 && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-3 px-8 py-3 rounded-full border border-neutral-700 text-sm font-mono tracking-widest uppercase text-neutral-400 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <PlusIcon
                    className={`w-4 h-4 transition-transform ${showAll ? "rotate-45" : ""}`}
                  />
                  {showAll ? "Show Less" : `All Skills (${skills.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <EditSkillModal
        skill={editingSkill}
        open={!!editingSkill}
        onOpenChange={(open) => !open && setEditingSkill(null)}
        onUpdate={handleEditSkill}
      />
    </section>
  );
}

function SkillCard({
  skill,
  isEditing,
  isAdmin,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  isEditing: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 hover:border-primary/30 hover:bg-neutral-900/60 transition-all duration-300 cursor-default">
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(64.66% 0.19548 40.184 / 0.08) 0%, transparent 70%)",
        }}
      />

      {skill.img && (
        <img
          src={skill.img}
          alt={skill.value}
          className="relative z-10 w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
        />
      )}

      <span className="relative z-10 text-xs font-mono text-neutral-400 group-hover:text-neutral-200 text-center leading-tight transition-colors">
        {skill.value}
      </span>

      {isAdmin && isEditing && (
        <div className="absolute top-2 right-2 z-20 hidden group-hover:flex gap-1 bg-neutral-900/95 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-primary/20 rounded transition-colors"
          >
            <Edit2Icon className="w-3 h-3 text-primary" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
          >
            <Trash2Icon className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
