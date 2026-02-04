import Banner from "./Banner";
import About from "./About";
import Projects from "./Projects";
import Experience from "./Experience";
import Contact from "./Contact";
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
      <Experience
        initialExperiences={initialExperiences}
        initialSkills={initialSkills}
      />
      <Contact />
    </div>
  );
}
