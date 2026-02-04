/* eslint-disable @next/next/no-img-element */

import { Project } from "@/types";
import { ExternalLinkIcon, GithubIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export function ProjectCard({
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

        <p className="text-sm text-neutral-300 line-clamp-2 mb-4 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300">
          {project.description}
        </p>

        <div className="flex gap-2 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
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
