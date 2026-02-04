"use client";

import { useState, useEffect, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Project } from "@/types";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectCard } from "../cards/ProjectCard";
import { PlusIcon } from "lucide-react";
import { ProjectModal } from "../cards/ProjectModal";

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  initialProjects: Project[];
}

export default function Projects({ initialProjects = [] }: ProjectsProps) {
  const { setSection } = usePageContext();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(!initialProjects.length);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialProjects.length) {
      loadProjects();
    } else {
      initialProjects.forEach((project) => {
        setSection(`project-${project.id}`, {
          ...project,
          collection: "projects",
          id: project.id as string,
        });
      });
    }
  }, [initialProjects]);

  useEffect(() => {
    if (containerRef.current && projects.length) {
      const cards = containerRef.current.querySelectorAll(".project-card");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        },
      );
    }
  }, [projects]);

  const loadProjects = async () => {
    try {
      const data = await fetchCollectionClient<Project>("projects");
      setProjects(data);

      data.forEach((project) => {
        setSection(`project-${project.id}`, {
          ...project,
          collection: "projects",
          id: project.id as string,
        });
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredProjects = projects.slice(0, 4);
  const displayedProjects = showAllProjects ? projects : featuredProjects;

  if (loading) {
    return (
      <div id="Projects" className="min-h-svh w-full fij">
        <div className="animate-pulse text-2xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <>
      <section
        id="Projects"
        className="min-h-svh w-full py-20 px-5 md:px-10 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="space-y-4" data-aos="fade-up">
            <h2 className="text-4xl lg:text-6xl font-bold">
              <ContentSpan sectionKey="projects-header" fieldKey="title">
                SELECTED WORKS
              </ContentSpan>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl">
              <ContentSpan sectionKey="projects-header" fieldKey="subtitle">
                A showcase of projects where creativity meets functionality.
              </ContentSpan>
            </p>
          </div>

          <div
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {displayedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>

          {projects.length > 4 && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="group flex items-center gap-3 px-8 py-4 bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-full hover:border-primary/50 hover:bg-neutral-800/70 transition-all"
              >
                <PlusIcon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showAllProjects && "rotate-45",
                  )}
                />
                <span className="font-medium">
                  {showAllProjects
                    ? "Show Less"
                    : `View All Projects (${projects.length})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          projects={projects}
          onClose={() => setSelectedProject(null)}
          onNavigate={(project) => setSelectedProject(project)}
        />
      )}
    </>
  );
}
