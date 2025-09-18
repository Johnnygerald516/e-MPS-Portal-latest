"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { base64ToDataUrl, debugBase64Image } from "@/lib/utils/base64";
import { User } from "lucide-react";

// Using our shared utility functions for base64 handling

export default function Base64Image({ 
  base64, 
  alt = "Base64 Image", 
  width = 160, 
  height = 160, 
  className = "object-contain",
  fallbackToImg = true 
}: { 
  base64: string; 
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackToImg?: boolean;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [useImgTag, setUseImgTag] = useState(false);

  useEffect(() => {
    if (!base64) {
      setError(true);
      return;
    }

    // Debug the incoming base64 data
    debugBase64Image(base64, `Base64Image Component (${alt})`);

    try {
      // Use our shared utility function to convert base64 to data URL
      const url = base64ToDataUrl(base64);
      if (url) {
        setDataUrl(url);
        setError(false);
        console.log(`✅ Successfully processed base64 image for ${alt}`);
      } else {
        console.error(`❌ Failed to convert base64 to data URL for ${alt}`);
        setError(true);
      }
    } catch (err) {
      console.error(`❌ Error processing base64 image for ${alt}:`, err);
      setError(true);
      if (fallbackToImg) {
        console.log(`⚠️ Falling back to img tag for ${alt}`);
        setUseImgTag(true);
      }
    }
  }, [base64, fallbackToImg, alt]);

  if (error && !useImgTag) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded border border-slate-200 w-full h-full">
        <User className="h-8 w-8 text-slate-400 mb-1" />
        <span className="text-xs text-slate-500 text-center px-2">Image Error</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded border border-slate-200 w-full h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-1"></div>
        <span className="text-xs text-slate-500 text-center px-2">Loading...</span>
      </div>
    );
  }

  // Fallback to regular img tag if Next.js Image fails
  if (useImgTag) {
    return (
      <img
        src={dataUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={dataUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => {
        if (fallbackToImg) {
          setUseImgTag(true);
        } else {
          setError(true);
        }
      }}
    />
  );
}
