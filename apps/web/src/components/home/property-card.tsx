"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Property } from "./property-carousel";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <article 
      className="w-full cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '251.14 / 238.58' }}>
        <Image
          src={property.images[currentImageIndex] || "/placeholder.jpg"}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {property.isGuestFavorite && (
          <div className="absolute top-2.5 left-2.5">
            <div className="relative bg-white rounded-2xl px-2 py-1 shadow-sm">
              <div 
                className="absolute inset-0 rounded-2xl p-[1px]"
                style={{
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <span className="text-xs font-semibold text-secondary relative z-10">
                Recomendación del viajero
              </span>
            </div>
          </div>
        )}

        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110"
          aria-label={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              isLiked 
                ? "fill-primary text-primary" 
                : "fill-black/50 text-white stroke-2"
            }`}
          />
        </button>

        {property.images.length > 1 && isHovered && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 
                  w-7 h-7 rounded-full bg-white/90 
                  flex items-center justify-center
                  hover:bg-white hover:scale-105 transition-all
                  shadow-md"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4 text-secondary" />
              </button>
            )}
            {currentImageIndex < property.images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 
                  w-7 h-7 rounded-full bg-white/90 
                  flex items-center justify-center
                  hover:bg-white hover:scale-105 transition-all
                  shadow-md"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-4 h-4 text-secondary" />
              </button>
            )}
          </>
        )}

        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {property.images.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? "bg-white scale-110" 
                    : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-[15px] text-secondary truncate flex-1">
            {property.location}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
            <span className="text-sm text-secondary">{property.rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-text-2 truncate">
          {property.distance}
        </p>

        <p className="text-sm text-text-2">
          {property.dates}
        </p>

        <p className="text-[15px] text-secondary pt-1">
          <span className="font-semibold">{property.price.toLocaleString()} €</span>
          <span className="font-normal"> en total</span>
        </p>
      </div>
    </article>
  );
};

export default PropertyCard;