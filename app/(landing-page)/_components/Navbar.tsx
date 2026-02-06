"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import ContentSpan from "@/components/customs/ContentEditSpan";
import { SOCIAL_LINKS, SECTIONS } from "@/lib/constants";

function Navbar() {
  const [passed, setPassed] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    function handleScroll() {
      setPassed(window.scrollY > 80);

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of SECTIONS) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = rect.bottom + window.scrollY;

          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "min-h-(--nav-h) w-full py-3 px-5 lg:px-10 flex items-center z-999 top-0 transition-all",
          passed &&
            "sticky backdrop-blur-sm bg-neutral-900/30 border-b border-white/5",
          !passed && "fixed",
        )}
      >
        <nav className="w-full flex items-center justify-between">
          <div>
            <ul className="inline-flex gap-4 lg:gap-6">
              {SOCIAL_LINKS.map((x, idx) => (
                <li
                  key={x.label}
                  className="flex items-center gap-4 lg:gap-6 group"
                >
                  <Link
                    href={x.link}
                    target="_blank"
                    title={x.name}
                    className="tracking-wider font-medium hover:scale-110 transition-transform hover:text-primary font-mono text-sm"
                  >
                    {x.label}
                  </Link>
                  {idx < SOCIAL_LINKS.length - 1 && (
                    <span className="block size-1 min-w-1 bg-primary rounded-full"></span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-lg xl:text-2xl font-medium tracking-widest hover:scale-110 transition-all hover:text-primary cursor-pointer"
            >
              <ContentSpan sectionKey="navbar" fieldKey="logo">
                {"dalgoridim"}
              </ContentSpan>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary cursor-pointer",
                  activeSection === section
                    ? "text-primary"
                    : "text-neutral-400",
                )}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="block lg:hidden">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-lg xl:text-2xl font-medium tracking-widest hover:scale-110 transition-all text-primary cursor-pointer"
            >
              <ContentSpan sectionKey="navbar" fieldKey="logo">
                {"dalgoridim"}
              </ContentSpan>
            </Link>
          </div>
        </nav>
      </header>

      <aside className="fixed top-1/2 -translate-y-1/2 left-8 hidden lg:flex flex-col items-center gap-8 z-998">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            title={section}
            className="group relative"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeSection === section
                  ? "bg-primary scale-150"
                  : "bg-neutral-600 hover:bg-primary/50 hover:scale-125",
              )}
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 group-hover:text-primary pointer-events-none">
              {section}
            </span>
          </button>
        ))}
      </aside>
    </>
  );
}

export default Navbar;
