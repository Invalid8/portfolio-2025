"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import AngledMarquee from "@/components/customs/AngledMarquee";
import { useEffect, useState } from "react";
import { fetchCollectionClient } from "@/lib/firebase/services";
import type { Skill } from "@/types";

interface BannerProps {
  initialSkills?: Skill[];
}

export default function Banner({ initialSkills = [] }: BannerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [loading, setLoading] = useState(!initialSkills.length);

  useEffect(() => {
    if (!initialSkills.length) {
      loadSkills();
    }
  }, [initialSkills]);

  const loadSkills = async () => {
    try {
      const data = await fetchCollectionClient<Skill>("skills");
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const skillValues = skills.map((x) => x.value);
  const fullList =
    skillValues.length > 0
      ? [...skillValues, ...staticList, ...skillValues]
      : staticList;

  const showMarquee = !loading && skills.length > 0;

  return (
    <div className="size-full min-h-[calc(100svh-var(--nav-h))] p-5 flex flex-col justify-center relative">
      <div className="md:px-[8%] xl:px-[10%] xl:max-w-7/10 z-10 space-y-6">
        <h1 className="text-[clamp(4rem,10vw,7rem)] leading-[clamp(4rem,10vw,7rem)] font-semibold">
          <ContentSpan
            sectionKey="banner"
            fieldKey="titleLine"
            className="font-bold"
          >
            {"Frontend~~br~~^^Developer^^"}
          </ContentSpan>
        </h1>

        <p className="text-base sm:text-lg xl:text-2xl leading-relaxed max-w-2xl">
          <ContentSpan
            sectionKey="banner"
            fieldKey="subtitle"
            className="space-y-0"
          >
            A Nigerian based **^^Frontend Developer^^** passionate about
            building accessible and user friendly
            **^^websites^^**.~~br~~~~br~~^^__**[My
            Resume](https://drive.google.com/file/d/1ixmuBYgzXQdXrTn1n9aoz4SWYRU715h-/view)**__^^
          </ContentSpan>
        </p>
      </div>

      {showMarquee && (
        <div className="absolute inset-0 size-full overflow-hidden max-w-[100vw] pointer-events-none">
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
      )}
    </div>
  );
}
