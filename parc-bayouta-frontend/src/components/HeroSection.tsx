import { motion } from "framer-motion";
import { ArrowDown, Calendar, PartyPopper, Coffee } from "lucide-react";
import { Button } from "./ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import logoHero from "@/assets/logo-hero.png";
import { useState, useEffect } from "react";
import { getSettings, HomeContent } from "@/api/settingsApi";

export const HeroSection = () => {
  const [content, setContent] = useState<HomeContent>({
    heroTitle: "Parc Bayouta",
    heroSubtitle: "Sport, détente et événements",
    heroDescription: "Un espace familial unique alliant terrains de mini-foot, salle des fêtes et café-restaurant pour tous vos moments de convivialité."
  });

  useEffect(() => {
    getSettings().then(data => {
      if (data.homeContent) setContent(data.homeContent);
    }).catch(err => console.error("Failed to fetch hero content", err));
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-[#111D29]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Logo with floating animation */}
          <motion.img
            src={logoHero}
            alt="Parc Bayouta"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: "easeOut"
            }}
            className="h-40 md:h-52 lg:h-64 w-auto mx-auto mb-6 object-contain animate-float drop-shadow-2xl"
          />

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-primary-foreground/90 text-sm font-medium mb-6"
          >
            ✨ Bienvenue à El Alia
          </motion.span>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            {content.heroTitle}
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/90 font-light mb-4">
            {content.heroSubtitle}
          </p>

          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            {content.heroDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="hero"
              size="xl"
              onClick={() => scrollToSection("#terrains")}
              className="group"
            >
              <Calendar className="w-5 h-5" />
              Réserver un terrain
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => scrollToSection("#salle")}
            >
              <PartyPopper className="w-5 h-5" />
              Réserver la salle
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => scrollToSection("#cafe")}
            >
              <Coffee className="w-5 h-5" />
              Notre menu
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.button
            onClick={() => scrollToSection("#services")}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <span className="text-sm">Découvrir</span>
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
