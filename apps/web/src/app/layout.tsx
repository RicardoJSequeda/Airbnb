import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbnb Full Clone - Microservicios & IA",
  description: "Clon de Airbnb con arquitectura de microservicios | Next.js 15 + NestJS + Prisma + Stripe | JWT Auth, Booking System, Payments, Reviews & Favorites | 33 REST API endpoints | shadcn/ui + TailwindCSS | TypeScript monorepo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preload"
          href="/fonts/AirbnbCereal-Bk.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/AirbnbCereal-Md.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}