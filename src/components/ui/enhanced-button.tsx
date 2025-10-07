"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { useNavigation } from "@/hooks/use-navigation";

interface EnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  navigateTo?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  loadingText?: string;
  navigationDelay?: number;
}

const buttonVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
  loading: {
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export function EnhancedButton({
  children,
  onClick,
  navigateTo,
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  loadingText = "Loading...",
  navigationDelay = 300,
}: EnhancedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { navigateTo: navigate, isNavigating } = useNavigation();

  const handleClick = async () => {
    if (disabled || isLoading || isNavigating) return;

    try {
      setIsLoading(true);

      // Execute onClick if provided
      if (onClick) {
        await onClick();
      }

      // Navigate if navigateTo is provided
      if (navigateTo) {
        // Keep button in loading state until navigation completes
        // The navigation hook will handle waiting for the next page to appear
        await navigate(navigateTo, {
          delay: navigationDelay,
          onStart: () => {
            // Keep loading state active
            setIsLoading(true);
          },
          onComplete: () => {
            // This will run after the next page appears
            setTimeout(() => {
              setIsLoading(false);
            }, 100);
          },
          onError: () => {
            setIsLoading(false);
          }
        });
      } else {
        // If no navigation, clear loading after a short delay
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error("Button action failed:", error);
      setIsLoading(false);
    }
  };

  const isButtonLoading = isLoading || isNavigating;

  return (
    <motion.div
      variants={buttonVariants}
      initial="idle"
      whileHover={!isButtonLoading && !disabled ? "hover" : "idle"}
      whileTap={!isButtonLoading && !disabled ? "tap" : "idle"}
      animate={isButtonLoading ? "loading" : "idle"}
    >
      <Button
        type={type}
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || isButtonLoading}
        className={`button-stable transition-all duration-200 ${className} ${
          isButtonLoading ? "cursor-not-allowed opacity-80" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {isButtonLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              {loadingText}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
