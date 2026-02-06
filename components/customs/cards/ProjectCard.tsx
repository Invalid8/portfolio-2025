/* eslint-disable @next/next/no-img-element */
import { Project } from "@/types";
import { ExternalLinkIcon, GithubIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

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

  const handleMouseEnter = () => {
    router.prefetch(`/project/${project.id}`);
    fetch(`/api/projects/${project.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      className="project-card group relative cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-primary/30 transition-all aspect-[4/3]"
      style={{
        background:
          "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(236, 72, 153, 0.06), transparent 40%)",
      }}
    >
      <div className="absolute inset-0">
        {!imageError ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-neutral-700/50 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">No image</p>
            </div>
          </div>
        )}
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