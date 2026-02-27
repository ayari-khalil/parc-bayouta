import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "../ui/button";
import navbarLogo from "@/assets/logo-header.jpg";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Terrains", href: "/fields" },
  { name: "Salle des Fêtes", href: "/event-hall" },
  { name: "Café-Restaurant", href: "/cafe-restaurant" },
  { name: "Événements", href: "/events" },
  { name: "Contact", href: "/contact" },
];

export const PublicHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerBg = isHomePage && !isScrolled
    ? "bg-transparent"
    : "bg-background/95 backdrop-blur-md shadow-soft";

  const textColor = isHomePage && !isScrolled
    ? "text-primary-foreground"
    : "text-foreground";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg} ${isScrolled ? "py-3" : "py-5"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
            <img
              src={navbarLogo}
              alt="Parc Bayouta"
              className={`object-contain rounded-xl transition-all ${isScrolled ? "h-8" : "h-10"
                }`}
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href ||
              (link.href !== "/" && location.pathname.startsWith(link.href));

            return (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-all duration-300 relative py-1 group ${isActive ? "text-primary" : textColor
                  }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+213555123456" className="flex items-center gap-2">
            <Phone className={`w-4 h-4 ${isHomePage && !isScrolled ? 'text-primary-foreground' : 'text-primary'}`} />
            <span className={`text-sm font-medium ${textColor}`}>
              +213 555 123 456
            </span>
          </a>
          <Button
            variant={isHomePage && !isScrolled ? "heroOutline" : "default"}
            asChild
          >
            <Link to="/fields">Réserver</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${textColor}`} />
          ) : (
            <Menu className={`w-6 h-6 ${textColor}`} />
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
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href ||
                  (link.href !== "/" && location.pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`font-medium py-3 px-4 rounded-lg transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <Button className="mt-4 w-full" size="lg" asChild>
                <Link to="/fields" onClick={() => setIsMobileMenuOpen(false)}>
                  Réserver maintenant
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
