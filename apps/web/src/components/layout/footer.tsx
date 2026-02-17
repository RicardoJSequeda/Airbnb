"use client";

import { Facebook, Instagram, Twitter, Globe } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const supportLinks = [
    { label: "Centro de ayuda", href: "/help" },
    { label: "Ayuda: problema de seguridad", href: "/help/safety" },
    { label: "AirCover", href: "/aircover" },
    { label: "Lucha contra la discriminación", href: "/against-discrimination" },
    { label: "Ayuda a la discapacidad", href: "/accessibility" },
    { label: "Opciones de cancelación", href: "/help/cancellation" },
    { label: "¿Problemas en el barrio?", href: "/neighbors" },
  ];

  const hostLinks = [
    { label: "Pon tu casa en Airbnb", href: "/host/homes" },
    { label: "Pon tu experiencia en Airbnb", href: "/host/experiences" },
    { label: "Pon tu servicio en Airbnb", href: "/host/services" },
    { label: "AirCover para anfitriones", href: "/aircover-for-hosts" },
    { label: "Recursos para anfitriones", href: "/resources" },
    { label: "Foro de la comunidad", href: "/community" },
    { label: "Ser un anfitrión responsable", href: "/responsible-hosting" },
    { label: "Apúntate a una clase gratuita", href: "/intro-to-hosting" },
    { label: "Busca un coanfitrión", href: "/co-hosts" },
  ];

  const airbnbLinks = [
    { label: "Novedades", href: "/release" },
    { label: "Newsroom", href: "/press/news" },
    { label: "Empleo", href: "/careers" },
    { label: "Inversores", href: "/investors" },
    { label: "Tarjetas regalo", href: "/giftcards" },
    { label: "Estancias con Airbnb.org", href: "/airbnb-org" },
  ];

  return (
    <footer className="bg-gray-100 border-t border-border-primary">
      <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-4">Asistencia</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary mb-4">Cómo ser anfitrión</h3>
            <ul className="space-y-3">
              {hostLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-secondary mb-4">Airbnb</h3>
            <ul className="space-y-3">
              {airbnbLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border-primary">
        <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
                <Globe className="w-4 h-4" />
                <span>Español (ES)</span>
              </button>
              <button className="flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
                <span>€</span>
                <span>EUR</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="https://facebook.com/airbnb"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-secondary" />
              </Link>
              <Link
                href="https://twitter.com/airbnb"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-secondary" />
              </Link>
              <Link
                href="https://instagram.com/airbnb"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-secondary" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-6 text-sm text-secondary">
            <span>© 2026 Airbnb, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link href="/terms/privacy" className="hover:underline">
              Privacidad
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="/terms" className="hover:underline">
              Condiciones
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="/about/company-details" className="hover:underline">
              Datos de la empresa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;