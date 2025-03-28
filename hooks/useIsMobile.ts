// src/hooks/useIsMobile.ts
import { useState, useEffect } from "react";

/**
 * Custom hook that returns a boolean indicating if the viewport width is less than the specified breakpoint.
 *
 * @param {number} breakpoint - The width threshold to determine mobile (default is 500px).
 * @returns {boolean} - True if the viewport width is less than the breakpoint.
 */
export function useIsMobile(breakpoint: number = 500): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    // Set the initial state
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
