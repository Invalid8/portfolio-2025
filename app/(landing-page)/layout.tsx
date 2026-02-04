import { PageProvider } from "@/lib/context/PageContent";
import { SurpriseUIProvider } from "@/lib/context/suprise-props";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Toolkit from "./_components/Toolkit";
import {
  fetchCollectionServer,
  fetchByIdServer,
} from "@/lib/firebase/server/services";
import { serializeFirestoreData } from "@/lib/serialize";
import { ReactNode } from "react";
import { Experience, Project, Skill, Section, NestedSections } from "@/types";

export default async function Layout({ children }: { children: ReactNode }) {
  let projects: Project[] = [];
  let experiences: Experience[] = [];
  let skills: Skill[] = [];
  let aboutData: Partial<Section> = {};
  let bannerData: Partial<Section> = {};
  let imagesData: Partial<Section> = {};

  try {
    [projects, experiences, skills] = await Promise.all([
      fetchCollectionServer<Project>("projects"),
      fetchCollectionServer<Experience>("experiences"),
      fetchCollectionServer<Skill>("skills"),
    ]);

    projects = serializeFirestoreData(projects);
    experiences = serializeFirestoreData(experiences);
    skills = serializeFirestoreData(skills);

    aboutData =
      serializeFirestoreData(await fetchByIdServer("portfolio", "about")) || {};
    bannerData =
      serializeFirestoreData(await fetchByIdServer("portfolio", "banner")) ||
      {};
    imagesData =
      serializeFirestoreData(await fetchByIdServer("portfolio", "images")) ||
      {};
  } catch (err) {
    console.error("Failed to load layout data:", err);
  }

  const initialSections: NestedSections = {
    portfolio: {
      about: { id: "about", collection: "portfolio", ...aboutData },
      banner: { id: "banner", collection: "portfolio", ...bannerData },
      images: { id: "images", collection: "portfolio", ...imagesData },
    },
    projects: Object.fromEntries(
      projects.map((p) => [
        `project-${p.id}`,
        { ...p, id: p.id as string, collection: "projects" },
      ]),
    ),
    experiences: Object.fromEntries(
      experiences.map((e) => [
        `experience-${e.id}`,
        { ...e, id: e.id as string, collection: "experiences" },
      ]),
    ),
    skills: Object.fromEntries(
      skills.map((s) => [
        `skill-${s.id}`,
        { ...s, id: s.id as string, collection: "skills" },
      ]),
    ),
  };

  return (
    <PageProvider initialSections={initialSections}>
      <SurpriseUIProvider>
        <Navbar />
        {children}
        <Footer />
        <Toolkit />
      </SurpriseUIProvider>
    </PageProvider>
  );
}
