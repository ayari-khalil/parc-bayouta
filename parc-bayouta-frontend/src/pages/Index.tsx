import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TerrainReservation } from "@/components/TerrainReservation";
import { SalleReservation } from "@/components/SalleReservation";
import { CafeMenu } from "@/components/CafeMenu";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <TerrainReservation />
        <SalleReservation />
        <CafeMenu />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
