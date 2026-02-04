/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { usePageContext } from "@/lib/context/PageContent";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Project } from "@/types";
import { ExternalLinkIcon, GithubIcon, XIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const card = cardRef.current;
    card.addEventListener("mousemove", handleMouseMove);

    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="project-card group relative cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-primary/30 transition-all aspect-[4/3]"
      style={{
        background:
          "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(236, 72, 153, 0.06), transparent 40%)",
      }}
    >
      <div className="absolute inset-0">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
      </div>

      <div className="relative h-full p-6 flex flex-col justify-end">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
            {project.type}
          </span>
        </div>

        <h3 className="text-2xl lg:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-neutral-300 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.description}
        </p>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.link && (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-xs flex items-center gap-1">
              <ExternalLinkIcon className="w-3 h-3" />
              Live
            </div>
          )}
          {project.github && (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-xs flex items-center gap-1">
              <GithubIcon className="w-3 h-3" />
              Code
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-neutral-800/50 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
        <PlusIcon className="w-6 h-6" />
      </div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const parseMarkdown = (text: string) => {
    return text
      .replace(/### (.*)/g, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/- (.*)/g, '<li class="ml-6 mb-2">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 p-3 bg-neutral-800/80 backdrop-blur rounded-full hover:bg-neutral-700 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8 lg:p-12">
          <div className="aspect-video rounded-xl overflow-hidden bg-neutral-800 mb-8">
            <EditableImage
              sectionKey={`project-${project.id}`}
              fieldKey="thumbnail"
              src={project.thumbnail}
              collection="projects"
              docId={project.id as string}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium uppercase tracking-wider mb-6">
                <ContentSpan
                  sectionKey={`project-${project.id}`}
                  fieldKey="type"
                >
                  {project.type}
                </ContentSpan>
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="title"
              >
                {project.title}
              </ContentSpan>
            </h2>

            <p className="text-xl text-neutral-300 leading-relaxed">
              <ContentSpan
                sectionKey={`project-${project.id}`}
                fieldKey="description"
              >
                {project.description}
              </ContentSpan>
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 pb-8 border-y border-neutral-700">
              <div>
                <span className="text-neutral-500 text-sm">Role</span>
                <p className="text-neutral-200 font-medium mt-1">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="role"
                  >
                    {project.role}
                  </ContentSpan>
                </p>
              </div>
              <div>
                <span className="text-neutral-500 text-sm">Year</span>
                <p className="text-neutral-200 font-medium mt-1">
                  <ContentSpan
                    sectionKey={`project-${project.id}`}
                    fieldKey="date"
                  >
                    {new Date(project.date).getFullYear()}
                  </ContentSpan>
                </p>
              </div>
            </div>

            {project.content && (
              <div
                className="prose prose-invert max-w-none prose-h2:text-primary prose-h3:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-4">${parseMarkdown(project.content)}</p>`,
                }}
              />
            )}

            <div className="flex gap-4 pt-8">
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ExternalLinkIcon className="w-5 h-5" />
                  Visit Live Site
                </Link>
              )}
              {project.github && (
                <Link
                  href={project.github}
                  target="_blank"
                  className="flex-1 px-6 py-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <GithubIcon className="w-5 h-5" />
                  View Code
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
