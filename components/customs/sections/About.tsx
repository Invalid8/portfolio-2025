"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import EditableImage from "@/components/customs/EditableImage";
import { usePageContext } from "@/lib/context/PageContent";

interface AboutSection {
  id: string;
  collection: string;
  aboutImg?: string;
  leading1?: string;
  leading2?: string;
}

export default function About() {
  const { sections } = usePageContext();

  const aboutSection: AboutSection = sections["portfolio"]?.["about"] || {
    id: "about",
    collection: "portfolio",
    aboutImg: "/images/AstronutCat.svg",
  };

  return (
    <section
      id="About"
      className="min-h-svh grid lg:grid-cols-2 items-center sm:p-10 sm:py-10 py-5 px-3 gap-12 lg:gap-16 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(64.66% 0.19548 40.184 / 0.07) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative flex items-center justify-center lg:min-h-svh">
        <EditableImage
          sectionKey="images"
          fieldKey="aboutImg"
          src={aboutSection.aboutImg || "/images/AstronutCat.svg"}
          collection="portfolio"
          docId="images"
          className="relative z-10 max-w-lg w-full xl:ml-10 transition-transform hover:scale-105 duration-500"
        />
      </div>

      <div className="flex flex-col justify-center h-full lg:pl-10 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-primary text-xs font-mono tracking-[0.35em] uppercase">Who I am</span>
          </div>
          <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-none tracking-tight">
            ABOUT ME
          </h2>
        </div>

        <div className="space-y-6 max-w-xl">
          <ContentSpan
            sectionKey="about"
            as="p"
            className="text-lg leading-relaxed text-neutral-300"
            fieldKey="leading1"
          >
            I am a Frontend Developer based in Nigeria with a strong foundation in Computer Science. I specialize in building accessible and user-friendly web applications, with a particular focus on React.js, React Native, Next.js, and TypeScript.
          </ContentSpan>

          <ContentSpan
            sectionKey="about"
            as="p"
            className="text-lg leading-relaxed text-neutral-400"
            fieldKey="leading2"
          >
            When I&apos;m not coding, I enjoy gaming, playing Mobile Legends, and diving into new technologies to stay ahead in my field.
          </ContentSpan>
        </div>

        <div className="flex items-center gap-12 pt-4 border-t border-neutral-800/60">
          {[
            { value: "yearsExperience", default: "5+", label: "Years Experience" },
            { value: "projectsCompleted", default: "20+", label: "Projects" },
            { value: "hackathonsWon", default: "2", label: "Hackathons Won" },
          ].map((stat) => (
            <div key={stat.value}>
              <div className="text-4xl font-bold text-primary tabular-nums">
                <ContentSpan sectionKey="stats" fieldKey={stat.value} collection="portfolio">
                  {stat.default}
                </ContentSpan>
              </div>
              <div className="text-xs font-mono tracking-widest uppercase text-neutral-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}