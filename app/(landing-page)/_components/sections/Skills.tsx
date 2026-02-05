"use client";

import { useState, useEffect, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { Skill, Section } from "@/types";
import { AddSkillModal, EditSkillModal } from "@/components/modals";
import { EmptyState } from "@/components/customs/EmptyState";
import { PlusIcon, Trash2Icon, Edit2Icon, CodeIcon } from "lucide-react";
import gsap from "gsap";
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
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const skillsCollection = sections["skills"] || {};
    const skillList = Object.values(skillsCollection)
      .filter(isSkill)
      .sort((a, b) => b.skillLevel - a.skillLevel);
    setSkills(skillList);
    setLoading(false);
  }, [sections]);

  useEffect(() => {
    if (skillsRef.current && skills.length) {
      const cards = skillsRef.current.querySelectorAll(".skill-card");
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: skillsRef.current,
            start: "top 80%",
          },
        },
      );
    }
  }, [skills]);

  const handleAddSkill = async (skillData: Partial<Skill>) => {
    try {
      const response = await fetch("/api/admin/firebase/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) throw new Error("Failed to add skill");

      const newSkill: Skill = await response.json();
      setSection("skills", `skill-${newSkill.id}`, {
        ...newSkill,
        collection: "skills",
        id: String(newSkill.id),
      });
      toast.success("Skill added successfully!");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
      throw error;
    }
  };

  const handleEditSkill = async (
    skillId: string | number,
    skillData: Partial<Skill>,
  ) => {
    try {
      const response = await fetch(`/api/admin/firebase/skills/${skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) throw new Error("Failed to update skill");

      setSection("skills", `skill-${skillId}`, {
        ...skillData,
        collection: "skills",
        id: String(skillId),
      });
      toast.success("Skill updated successfully!");
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error("Failed to update skill");
      throw error;
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const response = await fetch(`/api/admin/firebase/skills/${skillId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete skill");

      const updatedSkills = { ...sections.skills };
      delete updatedSkills[`skill-${skillId}`];

      setSection("skills", `skill-${skillId}`, {} as Section);

      toast.success("Skill deleted successfully!");
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };

  const displayedSkills = showAllSkills ? skills : skills.slice(0, 12);

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
      className="w-full py-20 px-3 sm:px-5 md:px-10 bg-neutral-900/20"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-4xl lg:text-6xl font-bold">
              <ContentSpan sectionKey="skills-header" fieldKey="title">
                SKILLS & TECHNOLOGIES
              </ContentSpan>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl">
              <ContentSpan sectionKey="skills-header" fieldKey="subtitle">
                Technologies and tools I work with to build exceptional digital
                experiences.
              </ContentSpan>
            </p>
          </div>
          {isAdmin && isEditing && <AddSkillModal onAdd={handleAddSkill} />}
        </div>

        {skills.length === 0 ? (
          <EmptyState
            title="No Skills Yet"
            description="Showcase your technical expertise by adding skills and technologies you work with. Let your abilities shine!"
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
          <div className="space-y-8">
            <div
              ref={skillsRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {displayedSkills.map((skill) => (
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
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="group flex items-center gap-3 px-8 py-4 bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-full hover:border-primary/50 hover:bg-neutral-800/70 transition-all"
                >
                  <PlusIcon
                    className={`w-5 h-5 transition-transform ${
                      showAllSkills ? "rotate-45" : ""
                    }`}
                  />
                  <span className="font-medium">
                    {showAllSkills
                      ? "Show Less"
                      : `View All Skills (${skills.length})`}
                  </span>
                </button>
              </div>
            )}
          </div>
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
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="skill-card group relative bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 hover:bg-neutral-800/50 transition-all cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {skill.img && (
        <div className="mb-3 flex items-center justify-center">
          <img
            src={skill.img}
            alt={skill.value}
            className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
            style={{ filter: "brightness(0.9)" }}
          />
        </div>
      )}
      <h4 className="font-medium text-sm text-center mb-2 group-hover:text-primary transition-colors">
        {skill.value}
      </h4>

      {isAdmin && isEditing && showActions && (
        <div className="absolute top-2 right-2 flex gap-1 bg-neutral-900/90 rounded-lg p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 bg-neutral-800 hover:bg-primary/20 rounded transition-colors"
            title="Edit skill"
          >
            <Edit2Icon className="w-3 h-3 text-primary" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-neutral-800 hover:bg-red-500/20 rounded transition-colors"
            title="Delete skill"
          >
            <Trash2Icon className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
