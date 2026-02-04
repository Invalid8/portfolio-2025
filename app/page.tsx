/* eslint-disable @typescript-eslint/no-explicit-any */
import Home from "./_components/Home";
import { fetchCollectionServer } from "@/lib/firebase/server/services";
import type { Project, Experience, Skill } from "@/types";

function serializeFirestoreData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  } else if (data && typeof data === "object") {
    if ("_seconds" in data && "_nanoseconds" in data) {
      return new Date(
        data._seconds * 1000 + data._nanoseconds / 1e6,
      ).toISOString();
    }
    const serialized: Record<string, any> = {};
    for (const key in data) {
      serialized[key] = serializeFirestoreData(data[key]);
    }
    return serialized;
  } else {
    return data;
  }
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

    projects = serializeFirestoreData(projects);
    experiences = serializeFirestoreData(experiences);
    skills = serializeFirestoreData(skills);

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
