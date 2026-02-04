"use client";

import { useState, useEffect } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Experience, Section } from "@/types";

import { useAuth } from "@/lib/context/auth";
import { AddExperienceModal } from "@/components/modals/AddNewItemModals";
import { ExperienceCard } from "../cards/ExpereinceCard";
import { PlusIcon } from "lucide-react";

export default function ExperienceSection() {
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  const experiencesCollection = sections["experiences"] || {};
  const experiences: Experience[] = Object.values(experiencesCollection).filter(
    isExperience,
  );

  useEffect(() => {
    if (Object.keys(experiencesCollection).length === 0) loadData();
  }, []);

  async function loadData() {
    try {
      const expData = await fetchCollectionClient<Experience>("experiences");

      expData.forEach((exp) => {
        const section: Section & Experience = {
          ...exp,
          id: String(exp.id),
          collection: "experiences",
        };
        setSection("experiences", `experience-${exp.id}`, section);
      });
    } catch (err) {
      console.error("Failed to load experiences:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddExperience = async (experienceData: Partial<Experience>) => {
    try {
      const res = await fetch("/api/admin/firebase/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experienceData),
      });

      if (!res.ok) throw new Error("Failed to add experience");

      const newExp: Experience = await res.json();

      setSection("experiences", `experience-${newExp.id}`, {
        ...newExp,
        id: String(newExp.id),
        collection: "experiences",
      });
    } catch (err) {
      console.error("Error adding experience:", err);
    }
  };

  const displayedExperiences = showAllExperiences
    ? experiences
    : experiences.slice(0, 3);

  if (loading && experiences.length === 0) {
    return (
      <div
        id="Experience"
        className="min-h-svh w-full flex justify-center items-center"
      >
        <div className="animate-pulse text-2xl">Loading experience...</div>
      </div>
    );
  }

  return (
    <section id="Experience" className="min-h-svh w-full py-20 px-5 md:px-10">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 flex items-start justify-between">
          <div>
            <h2 className="text-4xl lg:text-6xl font-bold">
              <ContentSpan sectionKey="experience-header" fieldKey="title">
                EXPERIENCE
              </ContentSpan>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl">
              <ContentSpan sectionKey="experience-header" fieldKey="subtitle">
                My professional journey building exceptional digital
                experiences.
              </ContentSpan>
            </p>
          </div>

          {isAdmin && isEditing && (
            <AddExperienceModal onAdd={handleAddExperience} />
          )}
        </div>

        <div className="space-y-6">
          {displayedExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}

          {experiences.length > 3 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowAllExperiences(!showAllExperiences)}
                className="group flex items-center gap-3 px-8 py-4 bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-full hover:border-primary/50 hover:bg-neutral-800/70 transition-all"
              >
                <PlusIcon
                  className={`w-5 h-5 transition-transform ${
                    showAllExperiences ? "rotate-45" : ""
                  }`}
                />
                <span className="font-medium">
                  {showAllExperiences
                    ? "Show Less"
                    : `View All Experience (${experiences.length})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function isExperience(section: Section): section is Experience & Section {
  return (
    section &&
    typeof section === "object" &&
    "position" in section &&
    "company" in section &&
    "skills" in section
  );
}
