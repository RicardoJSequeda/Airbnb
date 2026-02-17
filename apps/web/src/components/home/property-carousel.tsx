"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "./property-card";

export interface Property {
  id: string;
  title: string;
  location: string;
  distance: string;
  dates: string;
  price: number;
  rating: number;
  images: string[];
  isSuperhost?: boolean;
  isGuestFavorite?: boolean;
}

interface PropertyCarouselProps {
  properties: Property[];
  title?: string;
}

const PropertyCarousel = ({ properties, title }: PropertyCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardsToScroll, setCardsToScroll] = useState(1);

  // Calcular el ancho de cada card y cuántas scrollear basado en breakpoint
  const updateScrollConfig = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const firstCard = container.querySelector('[data-property-card]') as HTMLElement;
    
    if (firstCard) {
      const gap = 16; // gap-4 = 16px
      setCardWidth(firstCard.offsetWidth + gap);
    }

    // Breakpoint 744px: 4 cards, sino 1 card
    const viewportWidth = window.innerWidth;
    if (viewportWidth >= 744) {
      setCardsToScroll(4);
    } else {
      setCardsToScroll(1);
    }
  }, []);

  // Verificar si se puede scrollear
  const checkScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  // Scroll hacia la izquierda
  const scrollLeft = () => {
    if (!scrollContainerRef.current || !canScrollLeft) return;
    
    const scrollAmount = cardWidth * cardsToScroll;
    scrollContainerRef.current.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  };

  // Scroll hacia la derecha
  const scrollRight = () => {
    if (!scrollContainerRef.current || !canScrollRight) return;
    
    const scrollAmount = cardWidth * cardsToScroll;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateScrollConfig();
    checkScrollability();

    const handleResize = () => {
      updateScrollConfig();
      checkScrollability();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollConfig, checkScrollability]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollability, { passive: true });
    return () => container.removeEventListener("scroll", checkScrollability);
  }, [checkScrollability]);

  return (
    <section className="relative w-full">
      <div className="flex items-center justify-between max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 mb-4">
        {title && (
          <h2 className="text-[22px] font-semibold text-secondary">
            {title}
          </h2>
        )}
        
        <div className="hidden sm:flex gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`
              w-8 h-8 rounded-full bg-white border border-border-secondary
              flex items-center justify-center
              transition-all duration-200
              ${!canScrollLeft 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:shadow-md hover:scale-105 cursor-pointer"
              }
            `}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`
              w-8 h-8 rounded-full bg-white border border-border-secondary
              flex items-center justify-center
              transition-all duration-200
              ${!canScrollRight 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:shadow-md hover:scale-105 cursor-pointer"
              }
            `}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      <div className="relative max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12">

        <div
          ref={scrollContainerRef}
          className="
            flex gap-4 overflow-x-auto scrollbar-hide
            scroll-smooth snap-x snap-mandatory
            touch-pan-x
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {properties.map((property) => (
            <div
              key={property.id}
              data-property-card
              className="
                flex-shrink-0 snap-start
                w-[calc(50%-8px)] min-w-[140px]
                sm:w-[calc(33.333%-11px)]
                md:w-[calc(25%-12px)]
                lg:w-[calc(14.285%-14px)]
                xl:w-[247px]
              "
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;
