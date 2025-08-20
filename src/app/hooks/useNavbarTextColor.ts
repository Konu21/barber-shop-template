import { useEffect, useState } from "react";

export function useNavbarTextColor() {
  const [isOnHero, setIsOnHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection =
        document.querySelector("#hero") ||
        document.querySelector(".hero-section");
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const navbarHeight = 64; // Înălțimea navbar-ului

        // Verifică dacă navbar-ul este pe secțiunea hero
        const isOverHero =
          heroRect.bottom > navbarHeight && heroRect.top < navbarHeight;
        setIsOnHero(isOverHero);
      }
    };

    // Verifică la încărcare
    handleScroll();

    // Adaugă event listener pentru scroll
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return isOnHero;
}
