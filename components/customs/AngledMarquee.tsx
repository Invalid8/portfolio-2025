"use client";

import React from "react";
import Marquee from "react-fast-marquee";

interface AngledMarqueeProps {
  children: React.ReactNode;
  angle?: number;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  bgColor?: string;
  zIndex?: number;
  height?: string | number;
}

const AngledMarquee: React.FC<AngledMarqueeProps> = ({
  children,
  angle = 0,
  speed = 50,
  pauseOnHover = true,
  className = "",
  bgColor = "transparent",
  zIndex = 1,
}) => {
  const diagonal = "calc(100vw + 100vh)";
  return (
    <div
      className={`absolute overflow-hidden ${className}`}
      style={{
        top: "60%",
        left: "60%",
        width: diagonal,
        transform: `translate(-40%, -60%) rotate(${angle}deg)`,
        backgroundColor: bgColor,
        zIndex,
        overflow: "visible",
      }}
    >
      <Marquee
        pauseOnHover={pauseOnHover}
        speed={speed}
        className="h-full flex items-center"
      >
        {children}
      </Marquee>
    </div>
  );
};

export default AngledMarquee;
