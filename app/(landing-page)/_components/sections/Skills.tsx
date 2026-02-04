"use client";

import { useState, useEffect, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { useAuth } from "@/lib/context/auth";
import { usePageContext } from "@/lib/context/PageContent";
import { Skill, Section } from "@/types";
import { AddSkillModal } from "@/components/modals/AddNewItemModals";
import { PlusIcon } from "lucide-react";
import gsap from "gsap";

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
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const skillsCollection = sections["skills"] || {};
    const skillList = Object.values(skillsCollection)
      .filter(isSkill)
      .sort((a, b) => b.skillLevel - a.skillLevel);
    setSkills(skillList);
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
    } catch (error) {
      console.error("Error adding skill:", error);
      throw error;
    }
  };

  const displayedSkills = showAllSkills ? skills : skills.slice(0, 12);

  if (!skills.length) {
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
      className="w-full py-20 px-5 md:px-10 bg-neutral-900/20"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 flex items-start justify-between">
          <div>
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

        {skills.length > 0 && (
          <div className="space-y-8">
            <div
              ref={skillsRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {displayedSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
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
    </section>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="skill-card group relative bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 hover:bg-neutral-800/50 transition-all cursor-pointer">
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
    </div>
  );
}
