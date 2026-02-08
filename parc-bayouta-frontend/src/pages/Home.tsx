import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, PartyPopper, Coffee, CalendarDays, ArrowRight, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import logoHero from "@/assets/logo-hero.png";
import terrainImg from "@/assets/terrain-foot.jpg";
import salleImg from "@/assets/salle-fetes.jpg";
import cafeImg from "@/assets/cafe-restaurant.jpg";
import { events, getCategoryLabel, getCategoryColor } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { PublicLayout } from "@/components/layout/PublicLayout";

const services = [
  {
    icon: Calendar,
    title: "Terrains de Mini-Foot",
    description: "Deux terrains professionnels avec gazon synthétique et éclairage LED.",
    image: terrainImg,
    link: "/fields",
    cta: "Réserver un terrain",
    features: ["Gazon synthétique", "Éclairage LED", "Vestiaires"],
  },
  {
    icon: PartyPopper,
    title: "Salle des Fêtes",
    description: "Un espace élégant pour vos mariages, fiançailles et événements privés.",
    image: salleImg,
    link: "/event-hall",
    cta: "Réserver la salle",
    features: ["200 personnes", "Climatisation", "Cuisine équipée"],
  },
  {
    icon: Coffee,
    title: "Café-Restaurant",
    description: "Savourez nos spécialités dans un cadre chaleureux et convivial.",
    image: cafeImg,
    link: "/cafe-restaurant",
    cta: "Voir le menu",
    features: ["Plats du jour", "Café premium", "Terrasse"],
  },
];

const upcomingEvents = events.filter((e) => e.isActive && e.isFeatured).slice(0, 3);

export default function Home() {
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
                delay: 0.2,
                ease: "easeOut",
              }}
              className="h-40 md:h-52 lg:h-64 w-auto mx-auto mb-8 object-contain animate-float drop-shadow-2xl"
            />

            <span className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm text-primary-foreground rounded-full text-sm font-medium mb-6">
              Bienvenue à El Alia
            </span>

            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Sport, détente et événements dans un cadre exceptionnel
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/fields">
                  <Calendar className="w-5 h-5" />
                  Réserver un terrain
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/event-hall">
                  <PartyPopper className="w-5 h-5" />
                  Réserver la salle
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/events">
                  <CalendarDays className="w-5 h-5" />
                  Voir les événements
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToServices}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Nos Services
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un espace complet pour le sport, la détente et vos événements spéciaux
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card card-hover"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="default" className="w-full group/btn" asChild>
                    <Link to={service.link}>
                      {service.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12"
            >
              <div>
                <span className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">
                  À venir
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Événements</h2>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link to="/events">
                  Voir tous les événements
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-card card-hover"
                >
                  <div className="relative h-40">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}
                      >
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-primary font-medium mb-1">
                      {format(parseISO(event.date), "EEEE d MMMM", { locale: fr })} • {event.time}
                    </p>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{event.price.toLocaleString()} DA</span>
                      <Button size="sm" asChild>
                        <Link to={`/events/${event.slug}`}>Voir détails</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Prêt à nous rejoindre ?
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Réservez dès maintenant votre créneau ou contactez-nous pour plus d'informations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/fields">Réserver un terrain</Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
