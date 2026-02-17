import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayHub — Encuentra tu próximo alojamiento",
  description: "Reserva alojamientos únicos en todo el mundo. Registro fácil, pago seguro con Stripe y confirmación instantánea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}