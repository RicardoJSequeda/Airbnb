import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface InfoPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function InfoPageLayout({
  eyebrow,
  title,
  description,
  children,
}: InfoPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-[#FF385C]">
          {eyebrow}
        </p>
        <h1 className="mb-4 text-3xl font-semibold text-[#222222] md:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[#6A6A6A] md:text-lg">
          {description}
        </p>

        <div className="mt-10 space-y-6">{children}</div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-[#EBEBEB] pt-6">
          <Link
            href="/help"
            className="text-sm font-medium text-[#222222] hover:underline"
          >
            Centro de ayuda
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium text-[#222222] hover:underline"
          >
            Condiciones de uso
          </Link>
          <Link
            href="/terms/privacy"
            className="text-sm font-medium text-[#222222] hover:underline"
          >
            Política de privacidad
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
