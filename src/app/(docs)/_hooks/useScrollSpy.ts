"use client";

import { useEffect, useState } from "react";

/**
 * Hook that tracks which section is currently visible in the viewport
 * using IntersectionObserver for efficient scroll-based detection.
 */
export function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first section that is intersecting
        const visibleEntry = entries.find(
          (entry) => entry.isIntersecting
        );
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px", // Triggers when section is ~20% from top
        threshold: 0,
      }
    );

    // Observe all sections
    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
