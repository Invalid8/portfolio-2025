"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { Skill } from "@/types";
import ScribbleNote from "@/components/customs/notes/ScribbleNote";

export default function Banner() {
  const { sections } = usePageContext();

  const bannerSection = sections["portfolio"]?.["banner"] || {};
  const skills: Skill[] = bannerSection.skills || [];

  const staticList = [
    "React",
    "Next.js",
    "TypeScript",
    "TailwindCSS",
    "Node.js",
    "Firebase",
    "Svelte",
    "GraphQL",
    "CSS",
    "HTML",
    "JavaScript",
    "UI/UX",
    "SEO",
    "Git",
    "Figma",
    "Vite",
  ];
  const skillValues = skills.map((x) => x.value);
  const baseList = skillValues.length > 0 ? skillValues : staticList;
  const tickerList = [...baseList, ...staticList, ...baseList, ...staticList];

  return (
    <>
      <style>{`
        @keyframes _fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes _ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .b-tag  { animation: _fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .b-h1   { animation: _fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .b-sub  { animation: _fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s both; }
        .b-cta  { animation: _fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.44s both; }
        .b-tick { animation: _ticker 55s linear infinite; }
      `}</style>

      <div className="relative md:min-h-svh min-h-[95svh] w-full flex flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-[560px] h-[560px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(64.66% 0.19548 40.184 / 0.13) 0%, transparent 65%)",
              filter: "blur(90px)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 pt-32 pb-14 2xl:px-[10%] 2xl:pr-[15%] mx-auto w-full">
          <div className="flex items-center gap-10 xl:gap-16">
            <div className="flex-1 min-w-0">
              <div className="flex justify-end">
                <ScribbleNote mobileOnly />
              </div>
              <div className="b-tag mb-9" />

              <div className="b-h1 mb-8">
                <ContentSpan
                  sectionKey="banner"
                  fieldKey="titleLine"
                  as="h1"
                  className="text-[clamp(3.5rem,8vw,7rem)] font-black leading-none tracking-tighter uppercase"
                >
                  {"Frontend~~br~~^^Developer^^"}
                </ContentSpan>
              </div>

              <div className="b-sub max-w-2xl">
                <ContentSpan
                  sectionKey="banner"
                  fieldKey="subtitle"
                  as="p"
                  className="text-base md:text-2xl leading-relaxed text-neutral-300"
                >
                  {`A Nigerian based **^^Frontend Developer^^** passionate about building accessible and user friendly **^^websites^^**.`}
                </ContentSpan>
              </div>

              <div className="b-cta mt-8 flex flex-col gap-10">
                <ContentSpan
                  sectionKey="banner"
                  fieldKey="resume"
                  as="span"
                  className="inline-flex text-lg md:text-2xl uppercase tracking-widest underline-offset-8"
                >
                  {`^^__**[My Resume](https://drive.google.com/file/d/1ixmuBYgzXQdXrTn1n9aoz4SWYRU715h-/view)**__^^`}
                </ContentSpan>
              </div>
            </div>

            <ScribbleNote />
          </div>
        </div>

        <div className="relative z-10 border-t border-neutral-800/50 overflow-hidden hidden md:block">
          <div className="py-3.5 flex whitespace-nowrap">
            <span className="b-tick inline-flex items-center gap-8 flex-shrink-0">
              {tickerList.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-8 flex-shrink-0"
                >
                  <span className="text-[11px] font-mono tracking-[0.22em] uppercase text-neutral-600">
                    {item}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-primary/35 flex-shrink-0" />
                </span>
              ))}
            </span>
            <span
              className="b-tick inline-flex items-center gap-8 flex-shrink-0"
              aria-hidden
            >
              {tickerList.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-8 flex-shrink-0"
                >
                  <span className="text-[11px] font-mono tracking-[0.22em] uppercase text-neutral-600">
                    {item}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-primary/35 flex-shrink-0" />
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
