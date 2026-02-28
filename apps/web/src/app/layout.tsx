import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AirBnb — Encuentra tu próximo alojamiento",
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
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}