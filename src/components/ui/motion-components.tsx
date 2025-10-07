"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Professional page transition variants - very subtle
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.99,
    y: -8,
  },
};

export const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.4,
};

// Pop-in animation for forms and cards - very subtle
export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 30,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: {
      duration: 0.25,
    },
  },
};

// Stagger animation for form fields
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Button animation variants
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  loading: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Enhanced Motion Page Wrapper
interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pop" | "slide";
}

export function MotionPage({ 
  children, 
  className = "", 
  variant = "default" 
}: MotionPageProps) {
  const variants = variant === "pop" ? popVariants : pageVariants;
  
  return (
    <motion.div
      initial="initial"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={pageTransition}
      className={`w-full ${className}`}
      style={{
        minHeight: "calc(100vh - 200px)",
        position: "relative",
      }}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Motion Form Container
interface MotionFormProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionForm({ children, className = "" }: MotionFormProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`form-container ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Motion Form Field
interface MotionFieldProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionField({ 
  children, 
  className = "", 
  delay = 0 
}: MotionFieldProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      style={{
        transition: `all 0.3s ease-in-out ${delay}s`,
      }}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Motion Button with loading state
interface MotionButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function MotionButton({ 
  children, 
  isLoading = false, 
  onClick, 
  className = "",
  disabled = false,
  type = "button"
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      variants={buttonVariants}
      initial="idle"
      whileHover={!isLoading && !disabled ? "hover" : "idle"}
      whileTap={!isLoading && !disabled ? "tap" : "idle"}
      animate={isLoading ? "loading" : "idle"}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`button-stable ${className} ${
        isLoading ? "cursor-not-allowed opacity-80" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
