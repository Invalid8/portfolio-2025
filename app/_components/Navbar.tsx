"use client";

import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ContentSpan from "@/components/customs/ContentEditSpan";

const links = [
  {
    name: "Github",
    label: "GH",
    link: "",
  },
  {
    name: "LinkedIn",
    label: "LI",
    link: "",
  },
  {
    name: "Instagram",
    label: "IG",
    link: "",
  },
];

const sections = ["About", "Projects", "Experience"];

type SectionPositions = Record<string, { top: number; bottom: number }>;

function Navbar() {
  const [passed, setPassed] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const sectionPositionsRef = useRef<SectionPositions>({});

  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isHomePage) return;

    function updateSectionPositions() {
      const positions: Record<
        string,
        {
          top: number;
          bottom: number;
        }
      > = {};
      sections.forEach((section: string) => {
        const element = document.getElementById(section.replaceAll(" ", "_"));
        if (element) {
          const rect = element.getBoundingClientRect();
          positions[section] = {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
          };
        }
      });
      sectionPositionsRef.current = positions;
    }

    updateSectionPositions();
    window.addEventListener("resize", updateSectionPositions);

    return () => {
      window.removeEventListener("resize", updateSectionPositions);
    };
  }, [isHomePage]);

  useEffect(() => {
    function handleScroll() {
      setPassed(window.scrollY > 80);

      if (!isHomePage) return;

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let foundSection = "";
      for (const section of sections) {
        const pos = sectionPositionsRef.current[section];
        if (pos && scrollPosition >= pos.top && scrollPosition < pos.bottom) {
          foundSection = section;
          break;
        }
      }

      if (foundSection !== activeSection) {
        setActiveSection(foundSection);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage, activeSection]);

  const scrollToSection = (section: string) => {
    const element = document.getElementById(section.replaceAll(" ", "_"));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "min-h-(--nav-h) w-full py-3 px-5 lg:px-10 flex items-center flex-col z-999 sticky top-0 transition-all",
          passed && "backdrop-blur-sm bg-white/0.5"
        )}
      >
        <nav className="w-full grid grid-cols-2 md:grid-cols-3 items-center flex-1">
          <div>
            <ul className="inline-flex gap-4 lg:gap-6">
              {links.map((x, idx) => (
                <li
                  key={x.label}
                  className="flex items-center gap-4 lg:gap-6 group"
                >
                  <Link
                    href={x.link}
                    target="_blank"
                    title={x.name}
                    className="tracking-wider font-medium hover:scale-150 transition-transform hover:text-primary font-mono"
                  >
                    {x.label}
                  </Link>
                  {idx < links.length - 1 && (
                    <span className="block size-1.5 min-w-1.5 bg-primary rounded-full"></span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <Link
              href="/"
              className="block text-base sm:text-lg xl:text-3xl font-medium tracking-widest hover:scale-110 transition-all hover:text-primary"
            >
              <ContentSpan className="" sectionKey={"navbar"} fieldKey={"logo"}>
                dalgoridim
              </ContentSpan>
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:gap-18 justify-end">
            <button className="hover:scale-150 transition-transform cursor-pointer hover:-rotate-45 hover:text-primary">
              <SearchIcon />
            </button>
            <button
              onClick={() => setMenuIsOpen(true)}
              className="flex gap-4 items-center font-medium uppercase cursor-pointer hover:scale-[1.2] transition-transform group hover:text-primary"
            >
              Menu
              <span className="flex flex-col gap-1.5">
                <span className="w-6 h-0.5 bg-white group-hover:bg-primary block transition-transform group-hover:-translate-x-2 group-hover:translate-y-1 group-hover:-rotate-45"></span>
                <span className="w-4 h-0.5 bg-white group-hover:bg-primary block transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45"></span>
              </span>
            </button>
          </div>
        </nav>
      </header>

      {isHomePage && (
        <aside className="fixed top-0 bottom-0 -left-0 hidden lg:flex items-center justify-center z-998">
          <nav className="flex flex-col items-center justify-center gap-30">
            {sections.map((x, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(x)}
                className={cn(
                  "uppercase hover:text-primary rotate-90 cursor-pointer hover:scale-[1.2] transition-transform",
                  activeSection === x && "text-primary scale-110 font-bold"
                )}
              >
                {x}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <menu
        className={cn(
          "fixed z-999 right-0 flex items-center justify-center top-0 bottom-0 bg-neutral-700/10 backdrop-blur-sm w-full -translate-y-full transition-transform",
          menuIsOpen && "translate-y-0"
        )}
      >
        <button
          onClick={() => setMenuIsOpen(false)}
          className="lg:text-3xl flex gap-4 items-center font-medium uppercase cursor-pointer hover:scale-[1.2] transition-transform group hover:text-red-500 fixed top-10 md:right-10 right-5 text-red-500"
        >
          Close
          <span className="flex flex-col gap-1.5">
            <span className="w-6 md:w-12 md:h-1 h-0.5 bg-red-500 group-hover:bg-red-700 block transition-transform -translate-x-2 translate-y-1 -rotate-45"></span>
            <span className="w-4 md:w-10 md:h-1 h-0.5 bg-red-500 group-hover:bg-red-700 block transition-transform -translate-x-1 -translate-y-1 rotate-45"></span>
          </span>
        </button>
        <nav className="p-6">
          <ul className="flex flex-col justify-center items-center gap-10 md:gap-12">
            {["About", "Project", "Experience", "Contact Me"].map((x, i) => (
              <Link
                key={i}
                href={"/" + x.replaceAll(" ", "_").toLowerCase()}
                className="text-2xl md:text-3xl uppercase font-semibold hover:text-primary cursor-pointer hover:scale-[1.2] transition-transform"
              >
                {x}
              </Link>
            ))}
          </ul>
        </nav>
      </menu>
    </>
  );
}

export default Navbar;
