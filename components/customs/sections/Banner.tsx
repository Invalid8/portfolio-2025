"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import AngledMarquee from "@/components/customs/AngledMarquee";
import { usePageContext } from "@/lib/context/PageContent";
import { Skill } from "@/types";

export default function Banner() {
  const { sections } = usePageContext();

  const bannerSection = sections["portfolio"]?.["banner"] || {};
  const skills: Skill[] = bannerSection.skills || [];

  const staticList = [
    "Development",
    "UI/UX",
    "SEO",
    "Next JS",
    "React",
    "Svelte",
    "Vue Js",
    "CSS",
    "HTML",
    "TypeScript",
    "JavaScript",
    "TailwindCSS",
    "Firebase",
    "Node.js",
  ];

  const skillValues = skills.map((x) => x.value);

  const baseList = skillValues.length > 0 ? skillValues : staticList;
  const fullList = [
    ...baseList,
    ...baseList,
    ...baseList,
    ...staticList,
    ...staticList,
  ];

  const showMarquee = fullList.length > 0;

  return (
    <div className="size-full min-h-[calc(100svh-60px)] sm:min-h-[calc(100svh)] sm:p-5 p-3 flex flex-col justify-center relative">
      <div className="md:px-[8%] xl:px-[10%] xl:max-w-7/10 z-10 space-y-6">
        <ContentSpan
          sectionKey="banner"
          fieldKey="titleLine"
          as="h1"
          className="text-5xl sm:text-[clamp(4rem,10vw,6rem)] sm:leading-[clamp(4rem,10vw,6rem)] font-bold"
        >
          {bannerSection.titleLine || "Frontend~~br~~^^Developer^^"}
        </ContentSpan>

        <ContentSpan
          sectionKey="banner"
          fieldKey="subtitle"
          className="space-y-0 text-base sm:text-lg xl:text-2xl leading-relaxed max-w-2xl"
          as="p"
        >
          {bannerSection.subtitle ||
            `A Nigerian based **^^Frontend Developer^^** passionate about building accessible and user friendly **^^websites^^**.`}
        </ContentSpan>

        <ContentSpan
          sectionKey="banner"
          fieldKey="resume"
          className="space-y-0 text-base sm:text-lg xl:text-2xl leading-relaxed max-w-2xl"
          as="p"
        >
          {bannerSection.resume ||
            `^^__**[My Resume](https://drive.google.com/file/d/1ixmuBYgzXQdXrTn1n9aoz4SWYRU715h-/view)**__^^`}
        </ContentSpan>
      </div>

      {showMarquee && (
        <div className="absolute inset-0 size-full overflow-hidden max-w-[100vw] pointer-events-none hidden md:block">
          <AngledMarquee
            angle={-22}
            bgColor="#1f2937"
            zIndex={5}
            className="h-22 md:h-24 overflow-hidden"
          >
            <ul className="inline-flex gap-8 lg:gap-14 justify-center items-center">
              {fullList.map((item, i) => (
                <li
                  key={`marquee-1-${i}`}
                  className="flex items-center gap-8 lg:gap-14 group text-lg md:text-3xl uppercase"
                >
                  <span className="tracking-wider font-medium font-mono">
                    {item}
                  </span>
                  <span className="group-not-last:block hidden size-3 min-w-1.5 bg-primary rounded-full"></span>
                </li>
              ))}
            </ul>
          </AngledMarquee>

          <AngledMarquee
            angle={60}
            bgColor="var(--primary)"
            zIndex={4}
            speed={60}
            className="h-22 md:h-24 overflow-hidden"
          >
            <ul className="inline-flex gap-8 lg:gap-14 justify-center items-center">
              {fullList.map((item, i) => (
                <li
                  key={`marquee-2-${i}`}
                  className="flex items-center gap-8 lg:gap-14 group text-lg md:text-3xl uppercase"
                >
                  <span className="tracking-wider font-medium font-mono">
                    {item}
                  </span>
                  <span className="group-not-last:block hidden size-3 min-w-1.5 bg-neutral-800 rounded-full"></span>
                </li>
              ))}
            </ul>
          </AngledMarquee>
        </div>
      )}
    </div>
  );
}
