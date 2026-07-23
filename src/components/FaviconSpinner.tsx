"use client";

import React from "react";

interface FaviconSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  fullScreen?: boolean;
}

export default function FaviconSpinner({
  size = "md",
  label = "Loading YazMart...",
  fullScreen = false,
}: FaviconSpinnerProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-28 w-28",
    xl: "h-36 w-36",
  };

  const imgSizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-18 w-18",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Outer Glowing Gradient Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff6600] via-amber-400 to-cyan-500 p-[3px] animate-spin shadow-lg shadow-[#ff6600]/20" />
        
        {/* Inner Masked Background */}
        <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center" />

        {/* Center Logo / Favicon with Pulse Animation */}
        <div className="relative z-10 flex items-center justify-center animate-pulse">
          <img
            src="/logo_icon_round.png"
            alt="YazMart Loading"
            className={`${imgSizes[size]} object-contain rounded-full shadow-sm`}
          />
        </div>
      </div>

      {label && (
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-800">
          <span>{label}</span>
          <span className="inline-flex gap-0.5">
            <span className="animate-bounce delay-75">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-md transition-all">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center w-full">{content}</div>;
}
