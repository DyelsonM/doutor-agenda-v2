"use client";

import { useEffect, useRef } from "react";

interface UseSlowScrollOptions {
  speed?: number; // Multiplier for scroll speed (0.1 = 10% of normal speed)
  smoothness?: number; // Animation duration in ms
}

export function useSlowScroll(options: UseSlowScrollOptions = {}) {
  const { speed = 0.3, smoothness = 300 } = options;
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;

      isScrolling = true;

      const deltaY = e.deltaY * speed;
      const currentScrollTop = container.scrollTop;
      const targetScrollTop = currentScrollTop + deltaY;

      // Smooth scroll to target position
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, smoothness);
    };

    const handleScroll = (e: Event) => {
      e.preventDefault();
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [speed, smoothness]);

  return containerRef;
}
