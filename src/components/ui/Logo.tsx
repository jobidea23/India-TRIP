import React from "react";

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16A34A" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="url(#g1)" />
        <path d="M14 30 L24 16 L34 30" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="24" cy="34" r="3" fill="#FFFFFF" />
        <path d="M10 36 Q24 42 38 36" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <div className="leading-none">
        <div className="font-black text-brand-navy text-xl tracking-tight">INDIA TRIP</div>
        <div className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">YOUR RIDE, YOUR WAY.</div>
      </div>
    </div>
  );
}
