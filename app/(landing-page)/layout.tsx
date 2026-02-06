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

const PORTFOLIO_SECTIONS = [
  "navbar",
  "banner",
  "about",
  "stats",
  "images",
  "projects-header",
  "experience-header",
  "skills-header",
  "contact",
] as const;

export default async function Layout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: React.ReactNode;
}) {
  let projects: Project[] = [];
  let experiences: Experience[] = [];
  let skills: Skill[] = [];
  const portfolioSections: Record<string, Partial<Section>> = {};

  try {
    const [projectsData, experiencesData, skillsData, ...portfolioData] =
      await Promise.all([
        fetchCollectionServer<Project>("projects"),
        fetchCollectionServer<Experience>("experiences"),
        fetchCollectionServer<Skill>("skills"),
        ...PORTFOLIO_SECTIONS.map((section) =>
          fetchByIdServer("portfolio", section),
        ),
      ]);

    projects = serializeFirestoreData(projectsData);
    experiences = serializeFirestoreData(experiencesData);
    skills = serializeFirestoreData(skillsData);

    PORTFOLIO_SECTIONS.forEach((section, index) => {
      portfolioSections[section] =
        serializeFirestoreData(portfolioData[index]) || {};
    });
  } catch (err) {
    console.error("Failed to load layout data:", err);
  }

  const initialSections: NestedSections = {
    portfolio: Object.fromEntries(
      PORTFOLIO_SECTIONS.map((key) => [
        key,
        {
          id: key,
          collection: "portfolio",
          ...portfolioSections[key],
        },
      ]),
    ),
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
      {modal}
    </PageProvider>
  );
}
