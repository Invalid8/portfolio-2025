/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Experience, Skill } from "@/types";
import {
  MapPinIcon,
  ExternalLinkIcon,
  CalendarIcon,
  XIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceProps {
  initialExperiences?: Experience[];
  initialSkills?: Skill[];
}

export default function ExperienceSection({
  initialExperiences = [],
  initialSkills = [],
}: ExperienceProps) {
  const { setSection } = usePageContext();
  const [experiences, setExperiences] =
    useState<Experience[]>(initialExperiences);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [loading, setLoading] = useState(
    !initialExperiences.length && !initialSkills.length,
  );
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialExperiences.length || !initialSkills.length) {
      loadData();
    } else {
      initialExperiences.forEach((exp) => {
        setSection(`experience-${exp.id}`, {
          ...exp,
          id: exp.id as string,
          collection: "experiences",
        });
      });
    }
  }, [initialExperiences, initialSkills]);

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

  const loadData = async () => {
    try {
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

      const skillsData = await fetchCollectionClient<Skill>("skills");
      setSkills(skillsData.sort((a, b) => b.skillLevel - a.skillLevel));
    } catch (error) {
      console.error("Failed to load experience data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedSkills = showAllSkills ? skills : skills.slice(0, 12);
  const displayedExperiences = showAllExperiences
    ? experiences
    : experiences.slice(0, 3);

  if (loading) {
    return (
      <div id="Experience" className="min-h-svh w-full fij">
        <div className="animate-pulse text-2xl">Loading experience...</div>
      </div>
    );
  }

  return (
    <section
      id="Experience"
      className="min-h-svh w-full py-20 px-5 md:px-10 bg-neutral-900/20"
    >
      <div className="max-w-7xl mx-auto space-y-20">
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
                  className={`w-5 h-5 transition-transform ${showAllExperiences ? "rotate-45" : ""}`}
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
                    className={`w-5 h-5 transition-transform ${showAllSkills ? "rotate-45" : ""}`}
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

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <div className="group relative bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-2xl p-6 lg:p-8 hover:border-primary/30 hover:bg-neutral-800/50 transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-medium text-sm mb-4">
            <CalendarIcon className="w-4 h-4" />
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.duration"
            >
              {experience.position.duration}
            </ContentSpan>
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold mb-2">
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.title"
            >
              {experience.position.title}
            </ContentSpan>
          </h3>

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

          <p className="text-neutral-300 leading-relaxed">
            <ContentSpan
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.role"
            >
              {experience.position.role}
            </ContentSpan>
          </p>
        </div>
      </div>

      {experience.skills && experience.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-700/50">
          {experience.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-neutral-700/30 text-neutral-300 rounded-full text-xs border border-neutral-600/30 hover:border-primary/50 hover:bg-neutral-700/50 transition-all"
            >
              {skill.value}
            </span>
          ))}
        </div>
      )}
    </div>
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

      {/* <div className="text-xs text-neutral-500 text-center">
        {skill.skillLevel}%
      </div> */}
    </div>
  );
}
