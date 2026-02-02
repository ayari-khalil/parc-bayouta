import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { events, getCategoryLabel, getCategoryColor } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { sendWhatsAppMessage } from "@/lib/whatsappUtils";

export default function EventDetails() {
  const { slug } = useParams();
  const event = events.find(e => e.slug === slug);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    attendees: 1,
  });
  const { toast } = useToast();

  if (!event) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Événement non trouvé
            </h1>
            <Button asChild>
              <Link to="/events">Retour aux événements</Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const spotsLeft = event.maxCapacity - event.currentReservations;
  const isFull = spotsLeft <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Réservation confirmée !",
      description: `Votre réservation pour ${formData.attendees} personne(s) a été enregistrée.`,
    });

    // Send WhatsApp Notification to Admin
    sendWhatsAppMessage({
      type: 'Événement',
      title: event.title,
      name: formData.name,
      phone: formData.phone,
      date: format(parseISO(event.date), "dd/MM/yyyy"),
      time: event.time,
      attendees: formData.attendees,
    });

    setShowForm(false);
    setFormData({ name: "", phone: "", email: "", attendees: 1 });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-24 pb-0">
        <div className="container mx-auto px-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative rounded-2xl overflow-hidden h-64 md:h-96"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${getCategoryColor(event.category)}`}>
                  {getCategoryLabel(event.category)}
                </span>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="capitalize">
                    {format(parseISO(event.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{event.time} {event.endTime && `- ${event.endTime}`}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  {isFull ? (
                    <span className="text-destructive font-medium">Complet</span>
                  ) : (
                    <span>{spotsLeft} places restantes</span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {event.longDescription}
              </p>

              {/* Price & CTA */}
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix par personne</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {event.price.toLocaleString()} DA
                    </p>
                  </div>
                  {!isFull && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Places disponibles</p>
                      <p className="text-2xl font-bold text-foreground">{spotsLeft}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isFull}
                  onClick={() => setShowForm(true)}
                >
                  <Ticket className="w-5 h-5" />
                  {isFull ? "Complet" : "Réserver maintenant"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reservation Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl shadow-hover p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Réserver pour cet événement
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl mb-4">
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {format(parseISO(event.date), "EEEE d MMMM yyyy", { locale: fr })} à {event.time}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Nom complet *</label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Téléphone *</label>
                <input
                  type="tel"
                  required
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="0555 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email (optionnel)</label>
                <input
                  type="email"
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Nombre de personnes *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={spotsLeft}
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="p-4 bg-muted rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{formData.attendees} x {event.price.toLocaleString()} DA</span>
                  <span className="font-medium text-foreground">
                    {(formData.attendees * event.price).toLocaleString()} DA
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{(formData.attendees * event.price).toLocaleString()} DA</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  Confirmer
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </PublicLayout>
  );
}
