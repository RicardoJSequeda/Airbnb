import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomeProperties from "@/components/home/home-properties";
import InspirationSection from "@/components/home/inspiration-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="h-50" />

      <HomeProperties />

      <InspirationSection />

      <Footer />
    </main>
  );
}