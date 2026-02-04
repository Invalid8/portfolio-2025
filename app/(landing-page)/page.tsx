"use client";

import Banner from "./_components/sections/Banner";
import About from "./_components/sections/About";
import Projects from "./_components/sections/Projects";
import Experience from "./_components/sections/Experience";
import Skills from "./_components/sections/Skills";
import Contact from "./_components/sections/Contact";

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
