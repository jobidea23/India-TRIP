import React from "react";

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="16" fill="#16A34A" />
        <path d="M18 40 L32 20 L46 40 Z" fill="#FFFFFF" />
        <circle cx="32" cy="44" r="4" fill="#2563EB" />
        <path d="M14 48 Q32 56 50 48" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <div className="font-extrabold text-brand-navy text-lg">INDIA TRIP</div>
        <div className="text-xs text-gray-500">Your Ride, Your Way.</div>
      </div>
    </div>
  );
}
