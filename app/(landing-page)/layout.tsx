import { PageProvider } from "@/lib/context/PageContent";
import { SurpriseUIProvider } from "@/lib/context/suprise-props";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Toolkit from "./_components/Toolkit";
import { fetchCollection, fetchById } from "@/lib/cms/data";
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
    // Reads go through the configured backend (Firebase or Postgres); adapters
    // return plain, already-serialized objects.
    const [projectsData, experiencesData, skillsData, ...portfolioData] =
      await Promise.all([
        fetchCollection<Project>("projects"),
        fetchCollection<Experience>("experiences"),
        fetchCollection<Skill>("skills"),
        ...PORTFOLIO_SECTIONS.map((section) =>
          fetchById("portfolio", section),
        ),
      ]);

    projects = projectsData as Project[];
    experiences = experiencesData as Experience[];
    skills = skillsData as Skill[];

    PORTFOLIO_SECTIONS.forEach((section, index) => {
      portfolioSections[section] =
        (portfolioData[index] as Partial<Section>) || {};
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
