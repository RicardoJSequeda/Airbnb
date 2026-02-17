import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCarousel from "@/components/home/property-carousel";
import InspirationSection from "@/components/home/inspiration-section";
import { 
  mockProperties, 
  trendingProperties, 
  nearbyProperties 
} from "@/data/mock-properties";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Header */}
      <div className="h-50" />

      <div className="space-y-10 py-8">
        <PropertyCarousel 
          properties={mockProperties} 
          title="Alojamientos populares en España" 
        />

        <PropertyCarousel 
          properties={trendingProperties} 
          title="Destinos de moda en España" 
        />

        <PropertyCarousel 
          properties={nearbyProperties} 
          title="Escapadas cerca de Madrid" 
        />

        <PropertyCarousel 
          properties={mockProperties.slice().reverse()} 
          title="Descubre Barcelona" 
        />

        <PropertyCarousel 
          properties={trendingProperties.slice().reverse()} 
          title="Costa mediterránea" 
        />
      </div>

      <InspirationSection />

      <Footer />
    </main>
  );
}