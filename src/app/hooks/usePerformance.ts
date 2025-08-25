"use client";

import { useState, useEffect, useCallback } from "react";

export function usePerformance() {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
    };

    // Detect slow connection
    const checkConnection = () => {
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        const isSlowConnection =
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.effectiveType === "3g";
        setIsLowPerformance(isSlowConnection);
      }
    };

    checkMobile();
    checkConnection();

    // Listen for connection changes
    if ("connection" in navigator) {
      (navigator as any).connection?.addEventListener(
        "change",
        checkConnection
      );
    }

    return () => {
      if ("connection" in navigator) {
        (navigator as any).connection?.removeEventListener(
          "change",
          checkConnection
        );
      }
    };
  }, []);

  const shouldLazyLoad = useCallback(() => {
    return isMobile || isLowPerformance;
  }, [isMobile, isLowPerformance]);

  const getImageQuality = useCallback(() => {
    if (isLowPerformance) return 60;
    if (isMobile) return 75;
    return 85;
  }, [isMobile, isLowPerformance]);

  const getImageSizes = useCallback(() => {
    if (isMobile) return "(max-width: 768px) 100vw, 50vw";
    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }, [isMobile]);

  return {
    isLowPerformance,
    isMobile,
    shouldLazyLoad,
    getImageQuality,
    getImageSizes,
  };
}
