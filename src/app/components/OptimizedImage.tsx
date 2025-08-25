"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes = "100vw",
  quality = 75,
  placeholder = "blur",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const element = document.querySelector(`[data-src="${src}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (isInView || priority) {
      setImageSrc(src);
    }
  }, [isInView, priority, src]);

  // Generate optimized srcSet for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [640, 1024, 1920];
    return sizes.map((size) => `${baseSrc}?w=${size} ${size}w`).join(", ");
  };

  // Use AVIF if supported, fallback to WebP, then original
  const getOptimizedSrc = (originalSrc: string) => {
    if (typeof window !== "undefined" && "avif" in window) {
      return originalSrc.replace(/\.[^/.]+$/, ".avif");
    }
    return originalSrc.replace(/\.[^/.]+$/, ".webp");
  };

  const optimizedSrc = getOptimizedSrc(imageSrc);

  return (
    <div
      data-src={src}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: fill ? "100%" : height || "auto" }}
    >
      {imageSrc && (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          quality={quality}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          placeholder={placeholder}
          blurDataURL={
            blurDataURL ||
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          }
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // Fallback to original image if optimized version fails
            setImageSrc(src);
          }}
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
