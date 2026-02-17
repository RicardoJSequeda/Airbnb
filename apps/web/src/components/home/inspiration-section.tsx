"use client";

import { useState } from "react";
import Link from "next/link";

interface Destination {
  city: string;
  type: string;
  href: string;
}

interface Tab {
  id: string;
  label: string;
  destinations: Destination[];
}

const tabs: Tab[] = [
  {
    id: "trending",
    label: "Más buscados",
    destinations: [
      { city: "Madrid", type: "Apartamentos en alquiler", href: "/s/madrid/apartments" },
      { city: "Barcelona", type: "Villas en alquiler", href: "/s/barcelona/villas" },
      { city: "Sevilla", type: "Casas en alquiler", href: "/s/sevilla/houses" },
      { city: "Valencia", type: "Apartamentos en alquiler", href: "/s/valencia/apartments" },
      { city: "Málaga", type: "Villas en alquiler", href: "/s/malaga/villas" },
      { city: "Granada", type: "Casas rurales en alquiler", href: "/s/granada/cottages" },
      { city: "Bilbao", type: "Apartamentos en alquiler", href: "/s/bilbao/apartments" },
      { city: "San Sebastián", type: "Casas en alquiler", href: "/s/san-sebastian/houses" },
      { city: "Palma de Mallorca", type: "Villas en alquiler", href: "/s/palma/villas" },
      { city: "Ibiza", type: "Apartamentos en alquiler", href: "/s/ibiza/apartments" },
      { city: "Tenerife", type: "Casas en alquiler", href: "/s/tenerife/houses" },
      { city: "Las Palmas", type: "Villas en alquiler", href: "/s/las-palmas/villas" },
    ],
  },
  {
    id: "beaches",
    label: "Playas",
    destinations: [
      { city: "Marbella", type: "Villas en alquiler", href: "/s/marbella/villas" },
      { city: "Cádiz", type: "Apartamentos en alquiler", href: "/s/cadiz/apartments" },
      { city: "Tarifa", type: "Casas en alquiler", href: "/s/tarifa/houses" },
      { city: "Formentera", type: "Villas en alquiler", href: "/s/formentera/villas" },
      { city: "Costa Brava", type: "Casas en alquiler", href: "/s/costa-brava/houses" },
      { city: "Menorca", type: "Apartamentos en alquiler", href: "/s/menorca/apartments" },
      { city: "Lanzarote", type: "Villas en alquiler", href: "/s/lanzarote/villas" },
      { city: "Fuerteventura", type: "Casas en alquiler", href: "/s/fuerteventura/houses" },
      { city: "Almería", type: "Apartamentos en alquiler", href: "/s/almeria/apartments" },
      { city: "Alicante", type: "Villas en alquiler", href: "/s/alicante/villas" },
      { city: "Benidorm", type: "Apartamentos en alquiler", href: "/s/benidorm/apartments" },
      { city: "Sitges", type: "Casas en alquiler", href: "/s/sitges/houses" },
    ],
  },
  {
    id: "cities",
    label: "Ciudades",
    destinations: [
      { city: "París", type: "Apartamentos en alquiler", href: "/s/paris/apartments" },
      { city: "Londres", type: "Casas en alquiler", href: "/s/london/houses" },
      { city: "Roma", type: "Apartamentos en alquiler", href: "/s/rome/apartments" },
      { city: "Ámsterdam", type: "Casas flotantes en alquiler", href: "/s/amsterdam/houseboats" },
      { city: "Lisboa", type: "Apartamentos en alquiler", href: "/s/lisbon/apartments" },
      { city: "Berlín", type: "Lofts en alquiler", href: "/s/berlin/lofts" },
      { city: "Praga", type: "Apartamentos en alquiler", href: "/s/prague/apartments" },
      { city: "Viena", type: "Casas en alquiler", href: "/s/vienna/houses" },
      { city: "Dublín", type: "Apartamentos en alquiler", href: "/s/dublin/apartments" },
      { city: "Milán", type: "Lofts en alquiler", href: "/s/milan/lofts" },
      { city: "Florencia", type: "Apartamentos en alquiler", href: "/s/florence/apartments" },
      { city: "Venecia", type: "Casas en alquiler", href: "/s/venice/houses" },
    ],
  },
  {
    id: "historic",
    label: "Con historia",
    destinations: [
      { city: "Toledo", type: "Casas en alquiler", href: "/s/toledo/houses" },
      { city: "Segovia", type: "Apartamentos en alquiler", href: "/s/segovia/apartments" },
      { city: "Córdoba", type: "Casas en alquiler", href: "/s/cordoba/houses" },
      { city: "Salamanca", type: "Apartamentos en alquiler", href: "/s/salamanca/apartments" },
      { city: "Ávila", type: "Casas rurales en alquiler", href: "/s/avila/cottages" },
      { city: "Cuenca", type: "Casas en alquiler", href: "/s/cuenca/houses" },
      { city: "Cáceres", type: "Apartamentos en alquiler", href: "/s/caceres/apartments" },
      { city: "Mérida", type: "Casas en alquiler", href: "/s/merida/houses" },
      { city: "Ronda", type: "Villas en alquiler", href: "/s/ronda/villas" },
      { city: "Santiago de Compostela", type: "Apartamentos en alquiler", href: "/s/santiago/apartments" },
      { city: "Girona", type: "Casas en alquiler", href: "/s/girona/houses" },
      { city: "Úbeda", type: "Casas rurales en alquiler", href: "/s/ubeda/cottages" },
    ],
  },
  {
    id: "islands",
    label: "Islas",
    destinations: [
      { city: "Mallorca", type: "Villas en alquiler", href: "/s/mallorca/villas" },
      { city: "Ibiza", type: "Casas en alquiler", href: "/s/ibiza/houses" },
      { city: "Tenerife", type: "Apartamentos en alquiler", href: "/s/tenerife/apartments" },
      { city: "Gran Canaria", type: "Villas en alquiler", href: "/s/gran-canaria/villas" },
      { city: "Lanzarote", type: "Casas en alquiler", href: "/s/lanzarote/houses" },
      { city: "Fuerteventura", type: "Apartamentos en alquiler", href: "/s/fuerteventura/apartments" },
      { city: "La Palma", type: "Villas en alquiler", href: "/s/la-palma/villas" },
      { city: "Menorca", type: "Casas en alquiler", href: "/s/menorca/houses" },
      { city: "Formentera", type: "Apartamentos en alquiler", href: "/s/formentera/apartments" },
      { city: "El Hierro", type: "Casas rurales en alquiler", href: "/s/el-hierro/cottages" },
      { city: "La Gomera", type: "Villas en alquiler", href: "/s/la-gomera/villas" },
      { city: "La Graciosa", type: "Casas en alquiler", href: "/s/la-graciosa/houses" },
    ],
  },
  {
    id: "mountains",
    label: "Montañas",
    destinations: [
      { city: "Sierra Nevada", type: "Cabañas en alquiler", href: "/s/sierra-nevada/cabins" },
      { city: "Pirineos", type: "Casas rurales en alquiler", href: "/s/pyrenees/cottages" },
      { city: "Picos de Europa", type: "Cabañas en alquiler", href: "/s/picos-de-europa/cabins" },
      { city: "Jaca", type: "Apartamentos en alquiler", href: "/s/jaca/apartments" },
      { city: "Baqueira", type: "Casas en alquiler", href: "/s/baqueira/houses" },
      { city: "Formigal", type: "Apartamentos en alquiler", href: "/s/formigal/apartments" },
      { city: "Gredos", type: "Casas rurales en alquiler", href: "/s/gredos/cottages" },
      { city: "Cazorla", type: "Cabañas en alquiler", href: "/s/cazorla/cabins" },
      { city: "Ordesa", type: "Casas rurales en alquiler", href: "/s/ordesa/cottages" },
      { city: "Canfranc", type: "Apartamentos en alquiler", href: "/s/canfranc/apartments" },
      { city: "Ronda", type: "Villas en alquiler", href: "/s/ronda-mountains/villas" },
      { city: "Aínsa", type: "Casas en alquiler", href: "/s/ainsa/houses" },
    ],
  },
  {
    id: "activities",
    label: "Actividades",
    destinations: [
      { city: "Surf en Tarifa", type: "Experiencias", href: "/s/tarifa/surf" },
      { city: "Senderismo en Pirineos", type: "Experiencias", href: "/s/pyrenees/hiking" },
      { city: "Esquí en Sierra Nevada", type: "Experiencias", href: "/s/sierra-nevada/ski" },
      { city: "Golf en Marbella", type: "Experiencias", href: "/s/marbella/golf" },
      { city: "Buceo en Ibiza", type: "Experiencias", href: "/s/ibiza/diving" },
      { city: "Vela en Mallorca", type: "Experiencias", href: "/s/mallorca/sailing" },
      { city: "Cata de vinos en Rioja", type: "Experiencias", href: "/s/rioja/wine" },
      { city: "Flamenco en Sevilla", type: "Experiencias", href: "/s/sevilla/flamenco" },
      { city: "Gastronomía en San Sebastián", type: "Experiencias", href: "/s/san-sebastian/food" },
      { city: "Yoga en Ibiza", type: "Experiencias", href: "/s/ibiza/yoga" },
      { city: "Ciclismo en Mallorca", type: "Experiencias", href: "/s/mallorca/cycling" },
      { city: "Kayak en Costa Brava", type: "Experiencias", href: "/s/costa-brava/kayak" },
    ],
  },
];

const InspirationSection = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [showAll, setShowAll] = useState(false);

  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const displayedDestinations = showAll 
    ? currentTab?.destinations 
    : currentTab?.destinations.slice(0, 12);

  return (
    <section className="w-full bg-gray-100 py-12">
      <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12">
        <h2 className="text-[22px] font-semibold text-secondary mb-6">
          Inspiración para futuras escapadas
        </h2>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border-primary overflow-x-auto scrollbar-hide pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowAll(false);
              }}
              className={`
                text-sm font-medium pb-3 whitespace-nowrap transition-colors cursor-pointer
                ${activeTab === tab.id 
                  ? "text-secondary border-b-2 border-secondary" 
                  : "text-tertiary hover:text-secondary hover:border-b-2 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
          {displayedDestinations?.map((destination, index) => (
            <Link
              key={`${destination.city}-${index}`}
              href={destination.href}
              className="group"
            >
              <p className="text-sm font-medium text-secondary group-hover:underline">
                {destination.city}
              </p>
              <p className="text-sm text-tertiary">
                {destination.type}
              </p>
            </Link>
          ))}
        </div>

        {/* Show More Button */}
        {currentTab && currentTab.destinations.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-6 text-sm font-semibold text-secondary underline hover:no-underline cursor-pointer"
          >
            {showAll ? "Mostrar menos" : "Mostrar más"}
          </button>
        )}
      </div>
    </section>
  );
};

export default InspirationSection;
