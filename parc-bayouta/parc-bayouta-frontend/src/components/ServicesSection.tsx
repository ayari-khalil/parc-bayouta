import { motion } from "framer-motion";
import { Dribbble, PartyPopper, Coffee, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import terrainImg from "@/assets/terrain-foot.jpg";
import salleImg from "@/assets/salle-fetes.jpg";
import cafeImg from "@/assets/cafe-restaurant.jpg";

const services = [
  {
    id: "terrains",
    icon: Dribbble,
    title: "Terrains de Mini-Foot",
    description:
      "Deux terrains équipés avec gazon synthétique de qualité, éclairage LED et vestiaires modernes. Parfait pour vos matchs entre amis.",
    image: terrainImg,
    features: ["2 terrains disponibles", "Éclairage nocturne", "Créneaux de 1h30"],
    cta: "Réserver un terrain",
    href: "#terrains",
  },
  {
    id: "salle",
    icon: PartyPopper,
    title: "Salle des Fêtes",
    description:
      "Une salle polyvalente élégante pour vos mariages, anniversaires et événements privés. Capacité jusqu'à 200 personnes.",
    image: salleImg,
    features: ["Grande capacité", "Décoration personnalisable", "Parking gratuit"],
    cta: "Réserver la salle",
    href: "#salle",
  },
  {
    id: "cafe",
    icon: Coffee,
    title: "Café-Restaurant",
    description:
      "Un espace chaleureux pour savourer nos spécialités culinaires, boissons fraîches et pâtisseries maison dans une ambiance conviviale.",
    image: cafeImg,
    features: ["Terrasse ombragée", "Menu varié", "Wifi gratuit"],
    cta: "Voir le menu",
    href: "#cafe",
  },
];

export const ServicesSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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
            Tout pour vos loisirs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos espaces dédiés au sport, aux célébrations et à la détente
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 card-hover flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant="outline"
                  className="w-full group/btn mt-auto"
                  onClick={() => scrollToSection(service.href)}
                >
                  {service.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
