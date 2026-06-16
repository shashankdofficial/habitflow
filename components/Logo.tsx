import React from "react";

export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-inline-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12c0-2.12-.55-4.1-1.5-5.83M12 15.5l3 3 7.5-7.5"
        stroke="url(#logo-grad-inline-icon)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoFull({ className = "w-40 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-inline-full" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <g transform="translate(4, 4)">
        <path
          d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12c0-2.12-.55-4.1-1.5-5.83M12 15.5l3 3 7.5-7.5"
          stroke="url(#logo-grad-inline-full)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="44"
        y="26"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.5px"
      >
        HabitFlow
      </text>
    </svg>
  );
}
