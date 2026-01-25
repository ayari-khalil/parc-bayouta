import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const contactInfo = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "+213 555 123 456",
    href: "tel:+213555123456",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+213 555 123 456",
    href: "https://wa.me/213555123456",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@parcbayouta.dz",
    href: "mailto:contact@parcbayouta.dz",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Route principale, El Alia, Algérie",
    href: "https://maps.google.com",
  },
];

const hours = [
  { day: "Lundi - Jeudi", time: "08:00 - 23:00" },
  { day: "Vendredi", time: "14:00 - 23:00" },
  { day: "Samedi - Dimanche", time: "08:00 - 00:00" },
];

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Contact
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contactez-nous
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une question ? Une demande spéciale ? N'hésitez pas à nous contacter
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="p-4 bg-card rounded-xl shadow-soft hover:shadow-card transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <info.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      <p className="font-medium text-foreground">{info.value}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="bg-card rounded-2xl shadow-card p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Horaires d'ouverture
                </h3>
              </div>
              <ul className="space-y-2">
                {hours.map((h, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium text-foreground">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12805.943376929382!2d7.0!3d36.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ4JzAwLjAiTiA3wrAwMCcwMC4wIkU!5e0!3m2!1sfr!2sdz!4v1600000000000!5m2!1sfr!2sdz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Parc Bayouta"
              />
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-2xl shadow-card p-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Envoyez-nous un message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="0555 123 456"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Sujet *
                  </label>
                  <select
                    required
                    className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="terrain">Réservation terrain</option>
                    <option value="salle">Réservation salle des fêtes</option>
                    <option value="cafe">Commande café-restaurant</option>
                    <option value="evenement">Organisation d'événement</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    placeholder="Décrivez votre demande..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
