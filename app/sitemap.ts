import type { MetadataRoute } from "next";
import { fetchCollection } from "@/lib/cms/data";
import { Project } from "@/types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const projects = await fetchCollection<Project>("projects");
    projectEntries = projects.map((project) => ({
      url: `${SITE_URL}/project/${project.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to build project sitemap entries:", error);
  }

  return [...staticEntries, ...projectEntries];
}
