import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logoHero from "@/assets/logo-hero.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center text-center gap-6">

        {/* Logo & Tagline */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={logoHero}
            alt="Parc Bayouta"
            className="h-16 w-auto object-contain drop-shadow-lg"
          />
          <p className="text-primary-foreground/80 text-xs max-w-md">
            Votre destination sport, détente et événements à El Alia.
          </p>
        </div>

        {/* Navigation & Contact Combined */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-white/80 transition-colors">Accueil</Link>
          <Link to="/fields" className="hover:text-white/80 transition-colors">Terrains</Link>
          <Link to="/event-hall" className="hover:text-white/80 transition-colors">Salle</Link>
          <Link to="/cafe-restaurant" className="hover:text-white/80 transition-colors">Café</Link>
          <Link to="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
        </div>

        {/* Contact Icons Row */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-primary-foreground/80">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+216 555 123 456</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>contact@parcbayouta.tn</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>El Alia,Bizerte, Tunisie</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-primary-foreground/20" />

        {/* Bottom: Socials & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-primary-foreground/60">
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61578124673823"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/parc_bayouta/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
          <span>© {currentYear} Parc Bayouta. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
};
