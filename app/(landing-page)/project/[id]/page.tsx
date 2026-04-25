import { ProjectFullPage } from "@/components/customs/sections/ProjectFullPage";
import { getProjectById } from "@/lib/firebase/projects";
import { fetchCollectionServer } from "@/lib/firebase/server/services";
import { Project } from "@/types";
import { Metadata } from "next";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const SITE_URL = "https://dalgoridim.com";

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
        robots: { index: false, follow: false },
      };
    }

    const canonical = `/project/${project.id}`;
    const ogImage = project.thumbnail || "/images/og-image.png";

    return {
      title: project.title,
      description: project.description,
      alternates: { canonical },
      openGraph: {
        title: project.title,
        description: project.description,
        url: canonical,
        type: "article",
        siteName: "Daniel Fadamitan Portfolio",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description,
        images: [ogImage],
        creator: "@D_Invalid1",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Project",
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

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/project/${project.id}`,
    image: project.thumbnail,
    dateCreated: project.date,
    creator: {
      "@type": "Person",
      name: "Daniel Fadamitan",
      url: SITE_URL,
    },
    ...(project.link ? { sameAs: project.link } : {}),
    ...(project.github ? { codeRepository: project.github } : {}),
    ...(project.type ? { genre: project.type } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <ProjectFullPage project={project} />
    </>
  );
}
