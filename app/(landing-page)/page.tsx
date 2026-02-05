export const revalidate = 60;

import Banner from "../../components/customs/sections/Banner";
import About from "../../components/customs/sections/About";
import Projects from "../../components/customs/sections/Projects";
import Experience from "../../components/customs/sections/Experience";
import Skills from "../../components/customs/sections/Skills";
import Contact from "../../components/customs/sections/Contact";

export default function Page() {
  return (
    <>
      <Banner />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
    </>
  );
}
