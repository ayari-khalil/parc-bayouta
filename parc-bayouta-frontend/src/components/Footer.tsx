import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import logoHero from "@/assets/logo-hero.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <img 
                src={logoHero} 
                alt="Parc Bayouta" 
                className="h-20 md:h-24 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <p className="text-primary-foreground/80 text-xs leading-relaxed">
              Votre destination sport, détente et événements à El Alia. 
              Un espace familial de qualité pour tous vos moments de convivialité.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm mb-3">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#accueil" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#terrains" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Terrains de Mini-Foot
                </a>
              </li>
              <li>
                <a href="#salle" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Salle des Fêtes
                </a>
              </li>
              <li>
                <a href="#cafe" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Café-Restaurant
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">+213 555 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">contact@parcbayouta.dz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-foreground/60 mt-0.5" />
                <span className="text-primary-foreground/80">
                  Route principale<br />El Alia, Algérie
                </span>
              </li>
            </ul>
          </div>

          {/* Social & Hours */}
          <div>
            <h4 className="font-display font-bold text-sm mb-3">Suivez-nous</h4>
            <div className="flex gap-2 mb-4">
              <a
                href="https://www.facebook.com/profile.php?id=61578124673823"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/parc_bayouta/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <h4 className="font-display font-bold text-sm mb-2">Horaires</h4>
            <p className="text-xs text-primary-foreground/80">
              Lun-Jeu: 08:00 - 23:00<br />
              Ven: 14:00 - 23:00<br />
              Sam-Dim: 08:00 - 00:00
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/60">
          <p>© {currentYear} Parc Bayouta. Tous droits réservés.</p>
          <p>Conçu avec ❤️ à El Alia</p>
        </div>
      </div>
    </footer>
  );
};
