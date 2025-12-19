"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import AngledMarquee from "@/components/customs/AngledMarquee";
import { skills } from "@/data/skills";

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
];

const fullList = [
  ...skills.map((x) => x.value),
  ...staticList,
  ...staticList,
  ...staticList,
  ...staticList,
  ...staticList,
  ...skills.map((x) => x.value),
];

function Banner() {
  return (
    <div className="size-full min-h-[calc(100svh-var(--nav-h)-100px)] p-5 flex flex-col justify-center">
      <div className="md:px-[8%] xl:px-[10%] xl:max-w-7/10 z-10 space-y-6">
        <h1 className="text-[clamp(4rem,10vw,7rem)] leading-[clamp(4rem,10vw,7rem)] font-semibold">
          <ContentSpan
            sectionKey="banner"
            fieldKey="titleLine"
            className="font-bold"
          >
            Frontend ~~br~~ ^^Developer^^
          </ContentSpan>
        </h1>

        <p className="text-base sm:text-lg xl:text-2xl leading-relaxed max-w-2xl">
          <ContentSpan
            sectionKey="banner"
            fieldKey="subtitle"
            className="space-y-4"
          >
            A Nigerian based **^^Frontend Developer^^** passionate about
            building accessible and user friendly **^^websites^^**. ~~br~~
            ^^__**[My
            Resume](https://drive.google.com/file/d/1qcK4NgDfuG4QN_wR7XXxQHqhknuy04Ho/view)**__^^
          </ContentSpan>
        </p>
      </div>

      {/* Angled Marquees */}
      <div className="absolute inset-0 size-full overflow-hidden max-w-[100vw]">
        <AngledMarquee
          angle={-22}
          bgColor="#1f2937"
          zIndex={5}
          className="h-22 md:h-24 overflow-hidden"
        >
          <ul className="inline-flex gap-8 lg:gap-14 justify-center items-center">
            {fullList.map((item, i) => (
              <li
                key={i}
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
                key={i}
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
    </div>
  );
}

export default Banner;
