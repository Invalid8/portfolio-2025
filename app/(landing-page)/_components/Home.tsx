import Banner from "./sections/Banner";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import type { Project, Experience as ExperienceType, Skill } from "@/types";

interface HomeProps {
  initialProjects?: Project[];
  initialExperiences?: ExperienceType[];
  initialSkills?: Skill[];
}

export default function Home({
  initialProjects = [],
  initialExperiences = [],
  initialSkills = [],
}: HomeProps) {
  return (
    <div>
      <Banner initialSkills={initialSkills} />
      <About />
      <Projects initialProjects={initialProjects} />
      <Experience initialExperiences={initialExperiences} />
      <Skills initialSkills={initialSkills} />
      <Contact />
    </div>
  );
}
