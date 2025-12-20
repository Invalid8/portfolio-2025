"use client";

import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

function Navbar() {
  const [passed, setPassed] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  function isPassed() {
    if (!window) return;
    setPassed(window.scrollX > 80);
  }

  useEffect(() => {
    window.addEventListener("scroll", isPassed);

    return () => {
      window.removeEventListener("scroll", isPassed);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "min-h-(--nav-h) w-full py-3 px-5 lg:px-10 flex items-center flex-col z-999 sticky top-0",
          passed && "backdrop-blur-sm bg-white/1"
        )}
      >
        <nav className="w-full grid grid-cols-2 md:grid-cols-3 items-center flex-1">
          <div>
            <ul className="inline-flex gap-4 lg:gap-6">
              {links.map((x) => (
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
                  <span className="group-not-last:block hidden size-1.5 min-w-1.5 bg-primary rounded-full"></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <Link
              href="/"
              className="block text-base sm:text-lg xl:text-3xl font-medium tracking-widest hover:scale-110 transition-all hover:text-primary"
            >
              dalgoridim
            </Link>
          </div>

          <div className="flex items-center gap-4 lg:gap-18 justify-end">
            <button className="hover:scale-150 transition-transform cursor-pointer hover:-rotate-45 hover:text-primary">
              <SearchIcon />
            </button>
            <button
              onClick={() => setMenuIsOpen(true)}
              className="flex gap-4 group-hover:gap-3 items-center font-medium uppercase cursor-pointer hover:scale-120 transition-transform group hover:text-primary"
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
      <aside className="fixed top-0 bottom-0 left-0 hidden lg:flex items-center justify-center z-998">
        <nav className="flex flex-col items-center justify-center gap-30">
          {["About", "Project", "Experience"].map((x, i) => (
            <Link
              key={i}
              href={"#" + x.replaceAll(" ", "_")}
              className="uppercase rotate-90 hover:text-primary cursor-pointer hover:scale-120 transition-transform"
            >
              {x}
            </Link>
          ))}
        </nav>
      </aside>

      <menu
        className={cn(
          "fixed z-999 right-0 flex items-center justify-center top-0 bottom-0 bg-neutral-700/1 backdrop-blur-sm w-full -translate-y-full transition-transform",
          menuIsOpen && "translate-y-0"
        )}
      >
        <button
          onClick={() => setMenuIsOpen(false)}
          className="lg:text-3xl flex gap-4 group-hover:gap-3 group-hover:text-red-700 items-center font-medium uppercase cursor-pointer hover:scale-120 transition-transform group hover:text-red-500 fixed top-10 md:right-10 right-5 text-red-500"
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
                className="text-2xl md:text-3xl uppercase font-semibold hover:text-primary cursor-pointer hover:scale-120 transition-transform"
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
