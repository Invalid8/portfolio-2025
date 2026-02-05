import { ProjectFullPage } from "@/components/customs/sections/ProjectFullPage";
import { getProjectById } from "@/lib/firebase/projects";
import { fetchCollectionServer } from "@/lib/firebase/server/services";
import { Project } from "@/types";
import { Metadata } from "next";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  try {
    const projects = await fetchCollectionServer<Project>("projects");

    return projects.map((project) => ({
      id: String(project.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const project = await getProjectById(id);

    if (!project) {
      return {
        title: "Project Not Found",
        description: "The requested project could not be found.",
      };
    }

    return {
      title: `${project.title} | Portfolio`,
      description: project.description,
      openGraph: {
        title: project.title,
        description: project.description,
        images: [
          {
            url: project.thumbnail,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description,
        images: [project.thumbnail],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Project | Portfolio",
      description: "View project details",
    };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Link
            href="/#Projects"
            className="text-primary hover:underline flex items-center gap-2 justify-center"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return <ProjectFullPage project={project} />;
}
