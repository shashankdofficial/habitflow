"use client";

import { useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = colorMode === "dark";

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <div className="flex items-center justify-center">
      <style>{`
        .love-heart-wrapper #switch-theme {
          display: none;
        }
        .love-heart-wrapper .love-heart, 
        .love-heart-wrapper .love-heart::after {
          border-color: ${isDark ? "#a1a1aa" : "#71717a"};
          border: 1.5px solid;
          border-top-left-radius: 100px;
          border-top-right-radius: 100px;
          width: 10px;
          height: 8px;
          border-bottom: 0;
        }
        .love-heart-wrapper .round {
          position: absolute;
          z-index: 1;
          width: 8px;
          height: 8px;
          background: hsl(0deg 0% 100%);
          box-shadow: rgb(0 0 0 / 24%) 0px 0px 4px 0px;
          border-radius: 100%;
          left: 0px;
          bottom: -1px;
          transition: all 0.4s ease;
          animation: check-animation2 0.4s forwards;
        }
        .love-heart-wrapper input:checked + label .round {
          transform: translate(0px, 0px);
          animation: check-animation 0.4s forwards;
          background-color: hsl(0deg 0% 100%);
        }
        @keyframes check-animation {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(0px, 7px); }
          100% { transform: translate(7px, 7px); }
        }
        @keyframes check-animation2 {
          0% { transform: translate(7px, 7px); }
          50% { transform: translate(0px, 7px); }
          100% { transform: translate(0px, 0px); }
        }
        .love-heart-wrapper .love-heart {
          box-sizing: border-box;
          position: relative;
          transform: translate(2px, -4px) rotate(-45deg) scale(1.25);
          transform-origin: center center;
          display: block;
          border-color: ${isDark ? "#a1a1aa" : "#71717a"};
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, filter 0.2s ease;
        }
        .love-heart-wrapper:hover .love-heart {
          transform: translate(2px, -4px) rotate(-45deg) scale(1.48);
          filter: drop-shadow(0 2px 8px ${isDark ? "rgba(244, 114, 182, 0.4)" : "rgba(225, 29, 72, 0.3)"});
        }
        .love-heart-wrapper:active .love-heart {
          transform: translate(2px, -4px) rotate(-45deg) scale(1.15);
        }
        .love-heart-wrapper input:checked + .love-heart,
        .love-heart-wrapper input:checked + .love-heart::after,
        .love-heart-wrapper input:checked + .love-heart .bottom {
          border-color: hsl(347deg 81% 61%);
          box-shadow: inset 6px -5px 0px 2px hsl(347deg 99% 72%);
        }
        .love-heart-wrapper .love-heart::after,
        .love-heart-wrapper .love-heart .bottom {
          content: "";
          display: block;
          box-sizing: border-box;
          position: absolute;
          border-color: ${isDark ? "#a1a1aa" : "#71717a"};
        }
        .love-heart-wrapper .love-heart::after {
          right: -9px;
          transform: rotate(90deg);
          top: 7px;
        }
        .love-heart-wrapper .love-heart .bottom {
          width: 11px;
          height: 11px;
          border-left: 1.5px solid;
          border-bottom: 1.5px solid;
          border-color: ${isDark ? "#a1a1aa" : "#71717a"};
          left: -1px;
          top: 5px;
          border-radius: 0px 0px 0px 5px;
        }
      `}</style>

      <div className="love-heart-wrapper w-10 h-10 flex items-center justify-center cursor-pointer">
        <input
          id="switch-theme"
          type="checkbox"
          checked={isDark}
          onChange={toggleColorMode}
        />
        <label
          className="love-heart"
          htmlFor="switch-theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <i className="left" />
          <i className="right" />
          <i className="bottom" />
          <div className="round" />
        </label>
      </div>
    </div>
  );
}
