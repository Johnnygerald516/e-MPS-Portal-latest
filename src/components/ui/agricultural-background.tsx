"use client";

import React from "react";
import { cn } from "../../lib/utils";

type BackgroundType = "farm" | "hoes" | "tractor" | "fishing-nets" | "combined";

interface AgriculturalBackgroundProps {
  type?: BackgroundType;
  className?: string;
  children?: React.ReactNode;
  opacity?: number;
}

export function AgriculturalBackground({
  type = "combined",
  className,
  children,
  opacity = 0.15,
}: AgriculturalBackgroundProps) {
  // Use imported SVG files for better reliability
  const getBackgroundUrl = () => {
    switch (type) {
      case "farm":
        return "/assets/images/backgrounds/farm-pattern.svg";
      case "hoes":
        return "/assets/images/backgrounds/hoes-pattern.svg";
      case "tractor":
        return "/assets/images/backgrounds/tractor-pattern.svg";
      case "fishing-nets":
        return "/assets/images/backgrounds/fishing-nets-pattern.svg";
      case "combined":
        return "/assets/images/backgrounds/agricultural-combined.svg";
      default:
        return "/assets/images/backgrounds/agricultural-combined.svg";
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${getBackgroundUrl()})`,
          backgroundRepeat: type === "combined" ? "no-repeat" : "repeat",
          backgroundSize: type === "combined" ? "cover" : "auto",
          opacity: opacity,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
