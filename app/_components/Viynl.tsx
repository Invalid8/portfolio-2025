"use client";

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

function Viynl() {
  return (
    <div className="size-full min-h-svh p-5 flex flex-col justify-center relative">
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
          angle={-82}
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
        <AngledMarquee
          angle={10}
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

export default Viynl;
