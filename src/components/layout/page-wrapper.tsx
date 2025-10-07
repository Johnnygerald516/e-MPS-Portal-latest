"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pop" | "slide";
}

// Enhanced page transition variants - very subtle
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 15,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.99,
    y: -10,
  },
};

// Pop animation variant - very subtle
const popVariants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.98,
    y: -10,
  },
};

// Slide animation variant
const slideVariants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: -100,
    scale: 0.95,
  },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  duration: 0.5,
};

export function PageWrapper({ 
  children, 
  className = "", 
  variant = "default" 
}: PageWrapperProps) {
  const pathname = usePathname();

  const getVariants = () => {
    switch (variant) {
      case "pop":
        return popVariants;
      case "slide":
        return slideVariants;
      default:
        return pageVariants;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={pageTransition}
        className={`w-full ${className}`}
        style={{
          minHeight: "calc(100vh - 200px)",
          position: "relative"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
