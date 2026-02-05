"use client";

import Link from "next/link";
import { HomeIcon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 md:px-10 relative overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-3xl"></div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative flex items-center justify-center order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-3xl"></div>

          <div className="relative w-full max-w-lg">
            <img
              src="/images/AstronutCat.svg"
              alt="Lost in space"
              className="w-full transition-transform hover:scale-105 duration-500 opacity-80"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[12rem] lg:text-[16rem] font-black text-primary/10 select-none">
                404
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 order-1 lg:order-2">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <span className="text-primary font-medium text-sm">
                ERROR 404
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold">
              Lost in <span className="text-primary">Space</span>
            </h1>

            <p className="text-lg lg:text-xl text-neutral-400 leading-relaxed max-w-xl">
              Looks like you&apos;ve ventured into uncharted territory. The page
              you&apos;re looking for doesn&apos;t exist in this universe.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-full hover:border-primary/50 hover:bg-neutral-800/70 transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Go Back</span>
            </button>

            <Link
              href="/"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-primary/10 backdrop-blur border border-primary/30 rounded-full hover:bg-primary/20 transition-all"
            >
              <HomeIcon className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Back to Home</span>
            </Link>
          </div>

          <div className="pt-8 border-t border-neutral-800">
            <p className="text-sm text-neutral-500">
              If you believe this is a mistake, please{" "}
              <Link href="/#Contact" className="text-primary hover:underline">
                contact me
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </div>
  );
}
