"use client";

import { useState, useEffect } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Experience, Skill } from "@/types";
import { MapPinIcon, ExternalLinkIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";

function ExperienceSection() {
  const { setSection } = usePageContext();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load experiences
      const expData = await fetchCollectionClient<Experience>("experiences");
      const sorted = expData.sort((a, b) => {
        const getYear = (duration: string) => {
          const match = duration.match(/(\d{4})/g);
          return match ? parseInt(match[match.length - 1]) : 0;
        };
        return getYear(b.position.duration) - getYear(a.position.duration);
      });

      setExperiences(sorted);

      sorted.forEach((exp) => {
        setSection(`experience-${exp.id}`, {
          ...exp,
          id: exp.id as string,
          collection: "experiences",
        });
      });

      // Load skills
      const skillsData = await fetchCollectionClient<Skill>("skills");
      setSkills(skillsData.sort((a, b) => b.skillLevel - a.skillLevel));
    } catch (error) {
      console.error("Failed to load experience data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="Experience" className="min-h-svh w-full fij">
        <div className="animate-pulse text-2xl">Loading experience...</div>
      </div>
    );
  }

  return (
    <div
      id="Experience"
      className="min-h-svh w-full py-20 px-5 md:px-10 bg-neutral-900/20"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-4xl lg:text-6xl font-bold">
            <ContentSpan sectionKey="experience-header" fieldKey="title">
              EXPERIENCE
            </ContentSpan>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl">
            <ContentSpan sectionKey="experience-header" fieldKey="subtitle">
              My professional journey building exceptional digital experiences.
            </ContentSpan>
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-neutral-700 to-transparent" />

          {/* Experience Cards */}
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                index={index}
                isEven={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-neutral-800">
            <h3 className="text-3xl lg:text-4xl font-bold">
              <ContentSpan
                sectionKey="experience-header"
                fieldKey="skillsTitle"
              >
                Skills & Technologies
              </ContentSpan>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExperienceCard({
  experience,
  index,
  isEven,
}: {
  experience: Experience;
  index: number;
  isEven: boolean;
}) {
  return (
    <div
      className={`relative flex items-start ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8`}
    >
      {/* Timeline Dot */}
      <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-neutral-900" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-20" />
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="w-8 md:hidden" />

      {/* Card */}
      <div
        className={`flex-1 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12"}`}
      >
        <div className="group bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-2xl p-6 lg:p-8 hover:border-primary/30 hover:bg-neutral-800/70 transition-all">
          {/* Duration Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-medium text-sm mb-4`}
          >
            <CalendarIcon className="w-4 h-4" />
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.duration"
            >
              {experience.position.duration}
            </ContentSpan>
          </div>

          {/* Position */}
          <h3 className="text-2xl lg:text-3xl font-bold mb-2">
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.title"
            >
              {experience.position.title}
            </ContentSpan>
          </h3>

          {/* Company */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-neutral-300">
            {experience.company.link ? (
              <Link
                href={experience.company.link}
                target="_blank"
                className="text-primary hover:underline font-medium flex items-center gap-2 group/link"
              >
                <ContentSpan
                  sectionKey={`experience-${experience.id}`}
                  fieldKey="company.name"
                >
                  {experience.company.name}
                </ContentSpan>
                <ExternalLinkIcon className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <span className="text-primary font-medium">
                <ContentSpan
                  sectionKey={`experience-${experience.id}`}
                  fieldKey="company.name"
                >
                  {experience.company.name}
                </ContentSpan>
              </span>
            )}

            {experience.company.location && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-1 text-sm text-neutral-400">
                  <MapPinIcon className="w-4 h-4" />
                  <ContentSpan
                    sectionKey={`experience-${experience.id}`}
                    fieldKey="company.location"
                  >
                    {experience.company.location}
                  </ContentSpan>
                </span>
              </>
            )}
          </div>

          {/* Role Description */}
          <p className="text-neutral-300 leading-relaxed mb-4">
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.role"
            >
              {experience.position.role}
            </ContentSpan>
          </p>

          {/* Skills */}
          {experience.skills && experience.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-neutral-700/50 text-neutral-300 rounded-full text-xs border border-neutral-600/30"
                >
                  {skill.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty spacer for alignment */}
      <div className="hidden md:block flex-1" />
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="group relative bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 hover:bg-neutral-800/70 transition-all">
      {/* Icon */}
      {skill.img && (
        <div className="mb-3">
          <img
            src={skill.img}
            alt={skill.value}
            className="w-10 h-10 object-contain"
            style={{ filter: "brightness(0.9)" }}
          />
        </div>
      )}

      {/* Name */}
      <h4 className="font-medium text-sm mb-2">{skill.value}</h4>

      {/* Skill Level Bar */}
      <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 group-hover:bg-primary/80"
          style={{ width: `${skill.skillLevel}%` }}
        />
      </div>

      {/* Skill Level Percentage */}
      <span className="text-xs text-neutral-500 mt-2 block">
        {skill.skillLevel}%
      </span>
    </div>
  );
}

export default ExperienceSection;
