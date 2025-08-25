"use client";

import { useState, useEffect, ReactNode } from "react";

interface LazyComponentProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
}

export default function LazyComponent({
  children,
  threshold = 0.1,
  rootMargin = "50px",
  fallback = null,
  className = "",
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = document.querySelector(`[data-lazy-id="${Math.random()}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasIntersected]);

  return (
    <div data-lazy-id={Math.random()} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}
