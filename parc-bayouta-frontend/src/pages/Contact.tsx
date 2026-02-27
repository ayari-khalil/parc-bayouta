import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useToast } from "@/hooks/use-toast";
import { getSettings, Settings } from "@/api/settingsApi";
import { submitMessage } from "@/api/contactApi";

export default function Contact() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    getSettings().then(setSettings).catch(err => console.error("Failed to fetch contact page settings", err));
  }, []);

  const parkInfo = settings?.parkInfo || {
    phone: "+216 555 123 456",
    whatsapp: "+216 555 123 456",
    email: "contact@parcbayouta.tn",
    address: "Route principale, El Alia, Khitmine, Bizerte"
  };

  const openingHours = settings?.openingHours || {
    weekdays: "08:00 - 23:00",
    friday: "14:00 - 23:00",
    weekend: "08:00 - 00:00"
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Téléphone",
      value: parkInfo.phone,
      href: `tel:${parkInfo.phone.replace(/\s/g, '')}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: parkInfo.whatsapp,
      href: `https://wa.me/${parkInfo.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: parkInfo.email,
      href: `mailto:${parkInfo.email}`,
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: parkInfo.address,
      href: "https://maps.google.com",
    },
  ];

  const hours = [
    { day: "Lundi - Jeudi", time: openingHours.weekdays },
    { day: "Vendredi", time: openingHours.friday },
    { day: "Samedi - Dimanche", time: openingHours.weekend },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMessage(formData);
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Contact
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question ? Une demande spéciale ? N'hésitez pas à nous contacter
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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
                  src="https://maps.google.com/maps?q=37.14998704298729,9.996987783389775&hl=fr&z=14&output=embed"
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
              animate={{ opacity: 1, x: 0 }}
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
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    <Send className="w-5 h-5" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
