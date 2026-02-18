"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import type { Experience } from "@/types/experience";

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'COP') {
      return `$${price.toLocaleString('es-CO')} COP`;
    }
    return `${price.toLocaleString()} ${currency}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <Link href={`/experiences/${experience.id}`}>
      <article className="w-full cursor-pointer group block">
        {/* Imagen: ~65% de la tarjeta (4/3); texto ~35% con jerarquía clara */}
        <div
          className="relative w-full rounded-xl overflow-hidden bg-gray-200"
          style={{ aspectRatio: '4 / 3' }}
        >
          {experience.images.length > 0 ? (
            <Image
              src={experience.images[currentImageIndex] ?? experience.images[0]}
              alt={experience.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}

          {/* Badge "Popular" - gris oscuro semitransparente, texto blanco (referencia) */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-block bg-gray-800/90 text-white text-xs font-semibold rounded-full px-2.5 py-1 shadow-sm">
              Popular
            </span>
          </div>

          {/* Corazón - blanco delineado (referencia) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-2.5 right-2.5 p-2 transition-transform hover:scale-110 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
            aria-label={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked
                  ? "fill-primary text-primary"
                  : "text-white stroke-[2.5] stroke-gray-800/40 fill-transparent"
              }`}
            />
          </button>
        </div>

        {/* Texto: 30-40% de la tarjeta. Jerarquía: título (negrita) → precio → por participante → rating */}
        <div className="pt-3 pb-1 px-0.5">
          <h3 className="font-semibold text-[15px] text-secondary line-clamp-2 leading-snug mb-1.5">
            {experience.title}
          </h3>
          <p className="text-sm text-secondary mb-0.5">
            <span className="font-semibold">
              Desde {formatPrice(experience.pricePerParticipant, experience.currency)}
            </span>
          </p>
          <p className="text-sm text-text-2 mb-1">por participante</p>
          {typeof experience.averageRating === "number" && experience.averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-secondary text-secondary shrink-0" />
              <span className="text-sm text-secondary">
                {Number(experience.averageRating).toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ExperienceCard;
