"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  showLoadingIndicator?: boolean;
  loadingIndicatorSize?: "small" | "medium";
  loadingIndicatorVariant?: "default" | "primary" | "secondary" | "fancy";
  loadingPosition?: "inline" | "overlay";
  children: React.ReactNode;
}

export function NavLink({
  href,
  className,
  showLoadingIndicator = true,
  loadingIndicatorSize = "small",
  loadingIndicatorVariant = "fancy",
  loadingPosition = "inline",
  children,
  ...props
}: NavLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Reset loading state when pathname changes (navigation completed)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (showLoadingIndicator) {
      setIsLoading(true);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={cn("relative inline-flex items-center", className)}
      onClick={handleClick}
      {...props}
    >
      {loadingPosition === "overlay" && isLoading && showLoadingIndicator ? (
        <>
          <span className="opacity-70">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm rounded">
            <LoadingSpinner size={loadingIndicatorSize} variant={loadingIndicatorVariant} />
          </span>
        </>
      ) : (
        <>
          {children}
          {isLoading && showLoadingIndicator && (
            <span className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full ml-2">
              <LoadingSpinner size={loadingIndicatorSize} variant={loadingIndicatorVariant} />
            </span>
          )}
        </>
      )}
    </Link>
  );
}
