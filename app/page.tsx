/* eslint-disable @typescript-eslint/no-explicit-any */
import Home from "./_components/Home";
import { fetchCollectionServer } from "@/lib/firebase/server/services";
import type { Project, Experience, Skill } from "@/types";

function serializeTimestamps<T extends Record<string, any>>(obj: T): T {
  const serialized: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    if (value && typeof value === "object") {
      if ("_seconds" in value && "_nanoseconds" in value) {
        serialized[key] = new Date(
          value._seconds * 1000 + value._nanoseconds / 1e6,
        ).toISOString();
      } else {
        serialized[key] = serializeTimestamps(value);
      }
    } else {
      serialized[key] = value;
    }
  }
  return serialized as T;
}

export default async function Page() {
  let projects: Project[] = [];
  let experiences: Experience[] = [];
  let skills: Skill[] = [];

  try {
    [projects, experiences, skills] = await Promise.all([
      fetchCollectionServer<Project>("projects"),
      fetchCollectionServer<Experience>("experiences"),
      fetchCollectionServer<Skill>("skills"),
    ]);

    projects = projects.map(serializeTimestamps);
    experiences = experiences.map(serializeTimestamps);
    skills = skills.map(serializeTimestamps);

    experiences.sort((a, b) => {
      const getYear = (duration: string) => {
        const match = duration.match(/(\d{4})/g);
        return match ? parseInt(match[match.length - 1]) : 0;
      };
      return getYear(b.position.duration) - getYear(a.position.duration);
    });

    skills.sort((a, b) => b.skillLevel - a.skillLevel);
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }

  return (
    <Home
      initialProjects={projects}
      initialExperiences={experiences}
      initialSkills={skills}
    />
  );
}
