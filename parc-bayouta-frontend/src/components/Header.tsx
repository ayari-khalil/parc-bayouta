import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "./ui/button";

const navLinks = [
  { name: "Accueil", href: "#accueil" },
  { name: "Terrains", href: "#terrains" },
  { name: "Salle des Fêtes", href: "#salle" },
  { name: "Café-Restaurant", href: "#cafe" },
  { name: "Contact", href: "#contact" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/95 backdrop-blur-md shadow-soft py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#accueil"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#accueil");
          }}
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-2xl">B</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-display font-bold text-2xl leading-tight ${isScrolled ? 'text-foreground' : 'text-primary-foreground'}`}>
              Parc Bayouta
            </span>
            <span className={`text-sm font-body ${isScrolled ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
              El Alia
            </span>
          </div>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+213555123456" className="flex items-center gap-2">
            <Phone className={`w-4 h-4 ${isScrolled ? 'text-primary' : 'text-primary-foreground'}`} />
            <span className={`text-sm font-medium ${isScrolled ? 'text-foreground' : 'text-primary-foreground'}`}>
              +213 555 123 456
            </span>
          </a>
          <Button
            variant={isScrolled ? "default" : "heroOutline"}
            onClick={() => scrollToSection("#terrains")}
          >
            Réserver
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-primary-foreground'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-primary-foreground'}`} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-foreground font-medium py-2 hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button className="mt-4" onClick={() => scrollToSection("#terrains")}>
                Réserver maintenant
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
