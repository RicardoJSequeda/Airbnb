"use client";

import { Facebook, Instagram, Twitter, Globe } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const supportLinks = [
    { id: "help", label: "Centro de ayuda", href: "#" },
    { id: "cancellation", label: "Opciones de cancelación", href: "#" },
    { id: "safety", label: "Seguridad", href: "#" },
  ];

  const hostLinks = [
    { id: "host-homes", label: "Publica tu alojamiento", href: "#" },
    { id: "host-resources", label: "Recursos para anfitriones", href: "#" },
  ];

  const companyLinks = [
    { id: "about", label: "Sobre StayHub", href: "#" },
    { id: "careers", label: "Empleo", href: "#" },
  ];

  return (
    <footer className="bg-gray-100 border-t border-border-primary">
      <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-secondary mb-4">Asistencia</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.id}>
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
                <li key={link.id}>
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
            <h3 className="text-sm font-semibold text-secondary mb-4">Empresa</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.id}>
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
              <a
                href="#"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-secondary" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-secondary" />
              </a>
              <a
                href="#"
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-secondary" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-6 text-sm text-secondary">
            <span>© {new Date().getFullYear()} StayHub</span>
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