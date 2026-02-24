"use client";

import { useState, useEffect } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Experience, Section } from "@/types";
import { useAuth } from "@/lib/context/auth";
import { AddExperienceModal } from "@/components/modals";
import { EmptyState } from "@/components/customs/EmptyState";
import {
  BriefcaseIcon,
  PlusIcon,
  MapPinIcon,
  ExternalLinkIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { parseDurationStart } from "@/utils/dateFormatter";
import ContentSpanEdit from "@/components/customs/ContentEditSpan";
import Link from "next/link";

export default function ExperienceSection() {
  const { sections, setSection } = usePageContext();
  const { isAdmin, isEditing } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const experiencesCollection = sections["experiences"] || {};
  const experiences: Experience[] = Object.values(experiencesCollection)
    .filter(isExperience)
    .sort((a, b) => {
      const dateA = parseDurationStart(a.position.duration);
      const dateB = parseDurationStart(b.position.duration);
      return dateB.getTime() - dateA.getTime();
    });

  useEffect(() => {
    if (Object.keys(experiencesCollection).length === 0) loadData();
    else setLoading(false);
  }, []);

  async function loadData() {
    try {
      const expData = await fetchCollectionClient<Experience>("experiences");
      expData.forEach((exp) => {
        setSection("experiences", `experience-${exp.id}`, {
          ...exp,
          id: String(exp.id),
          collection: "experiences",
        });
      });
    } catch (err) {
      console.error("Failed to load experiences:", err);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }

  const handleAddExperience = async (
    experienceData: Omit<Experience, "id">,
  ) => {
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
      toast.success("Experience added successfully!");
    } catch (err) {
      console.error("Error adding experience:", err);
      toast.error("Failed to add experience");
      throw err;
    }
  };

  const displayed = showAll ? experiences : experiences.slice(0, 3);

  if (loading) {
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
    <section
      id="Experience"
      className="relative w-full py-24 px-4 sm:px-8 md:px-12 xl:px-20 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(64.66% 0.19548 40.184 / 0.06) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-primary text-xs font-mono tracking-[0.35em] uppercase">
                Career
              </span>
            </div>
            <ContentSpan
              sectionKey="experience-header"
              fieldKey="title"
              as="h2"
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-none tracking-tight"
            >
              EXPERIENCE
            </ContentSpan>
            <ContentSpan
              sectionKey="experience-header"
              fieldKey="subtitle"
              as="p"
              className="text-base text-neutral-400 max-w-xl mt-3"
            >
              My professional journey building exceptional digital experiences.
            </ContentSpan>
          </div>
          {isAdmin && isEditing && (
            <AddExperienceModal onAdd={handleAddExperience} />
          )}
        </div>

        {experiences.length === 0 ? (
          <EmptyState
            title="No Experience Yet"
            description="Build your professional story by adding your work experience."
            icon={
              <BriefcaseIcon
                className="w-16 h-16 text-neutral-600"
                strokeWidth={1.5}
              />
            }
            action={
              isAdmin && isEditing ? (
                <AddExperienceModal onAdd={handleAddExperience} />
              ) : null
            }
          />
        ) : (
          <div className="relative">
            <div className="space-y-0">
              {displayed.map((exp, i) => (
                <ExperienceRow
                  key={exp.id}
                  experience={exp}
                  index={i}
                  isLast={i === displayed.length - 1}
                />
              ))}
            </div>

            {experiences.length > 3 && (
              <div className="mt-10 flex justify-center md:justify-start md:pl-10">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-3 px-8 py-3 rounded-full border border-neutral-700 text-sm font-mono tracking-widest uppercase text-neutral-400 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <PlusIcon
                    className={`w-4 h-4 transition-transform ${showAll ? "rotate-45" : ""}`}
                  />
                  {showAll
                    ? "Show Less"
                    : `All Experience (${experiences.length})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ExperienceRow({
  experience,
  index,
  isLast,
}: {
  experience: Experience;
  index: number;
  isLast: boolean;
}) {
  const { isEditing } = useAuth();

  return (
    <div
      className={`relative group flex gap-0 md:gap-8 ${!isLast ? "pb-12" : ""}`}
    >
      <div className="flex-1 min-w-0 p-6 lg:p-8 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 hover:border-primary/25 hover:bg-neutral-900/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
            <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <ContentSpanEdit
              collection="experiences"
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.duration"
              className="text-xs font-mono text-primary"
            >
              {experience.position.duration}
            </ContentSpanEdit>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-600">
            <span className="tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        <ContentSpanEdit
          collection="experiences"
          sectionKey={`experience-${experience.id}`}
          fieldKey="position.title"
          className="text-xl lg:text-2xl font-bold mb-1 block"
          as="h3"
        >
          {experience.position.title}
        </ContentSpanEdit>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          {!isEditing && experience.company.link ? (
            <Link
              href={experience.company.link}
              target="_blank"
              className="text-primary font-medium hover:underline flex items-center gap-1.5 text-sm"
            >
              <ContentSpanEdit
                collection="experiences"
                sectionKey={`experience-${experience.id}`}
                fieldKey="company.name"
              >
                {experience.company.name}
              </ContentSpanEdit>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </Link>
          ) : isEditing ? (
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-mono w-12">
                  Name
                </span>
                <ContentSpanEdit
                  collection="experiences"
                  sectionKey={`experience-${experience.id}`}
                  fieldKey="company.name"
                  className="text-primary font-medium text-sm"
                >
                  {experience.company.name}
                </ContentSpanEdit>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-mono w-12">
                  Link
                </span>
                <ContentSpanEdit
                  collection="experiences"
                  sectionKey={`experience-${experience.id}`}
                  fieldKey="company.link"
                  className="text-primary font-medium text-sm flex-1"
                >
                  {experience.company.link || "https://"}
                </ContentSpanEdit>
              </div>
            </div>
          ) : (
            <span className="text-primary font-medium text-sm">
              {experience.company.name}
            </span>
          )}

          {experience.company.location && !isEditing && (
            <>
              <span className="text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
                <MapPinIcon className="w-3.5 h-3.5" />
                <ContentSpanEdit
                  collection="experiences"
                  sectionKey={`experience-${experience.id}`}
                  fieldKey="company.location"
                >
                  {experience.company.location}
                </ContentSpanEdit>
              </span>
            </>
          )}
        </div>

        <ContentSpanEdit
          collection="experiences"
          sectionKey={`experience-${experience.id}`}
          fieldKey="position.role"
          className="text-sm text-neutral-400 leading-relaxed block"
          as="p"
        >
          {experience.position.role}
        </ContentSpanEdit>

        {experience.skills && experience.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-neutral-800/60">
            {experience.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-neutral-800/60 text-neutral-400 border border-neutral-700/40 hover:border-primary/40 hover:text-neutral-200 transition-all"
              >
                {skill.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
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
