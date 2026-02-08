import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, PartyPopper, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "./ui/button";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import salleImg from "@/assets/salle-fetes.jpg";

// Simulated booked dates
const bookedDates = [
  "2025-01-25",
  "2025-01-26",
  "2025-02-01",
  "2025-02-14",
  "2025-02-15",
];

const eventTypes = [
  "Mariage",
  "Fiançailles",
  "Anniversaire",
  "Baptême",
  "Réunion d'entreprise",
  "Autre",
];

export const SalleReservation = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "",
    guests: "",
    message: "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const isDateBooked = (date: Date) => {
    return bookedDates.includes(format(date, "yyyy-MM-dd"));
  };

  const handleDateClick = (date: Date) => {
    if (!isDateBooked(date) && !isBefore(date, new Date())) {
      setSelectedDate(date);
    }
  };

  return (
    <section id="salle" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">
            Événementiel
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Salle des Fêtes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un espace élégant et modulable pour tous vos événements importants
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Salle Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl overflow-hidden shadow-card sticky top-24">
              <img
                src={salleImg}
                alt="Salle des fêtes"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Notre Salle
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-secondary" />
                    Capacité jusqu'à 200 personnes
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary" />
                    Climatisation centrale
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary" />
                    Sonorisation professionnelle
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary" />
                    Cuisine équipée
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary" />
                    Grand parking privé
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-secondary/10 rounded-xl">
                  <p className="text-sm text-foreground font-medium">À partir de</p>
                  <p className="text-3xl font-display font-bold text-secondary">
                    50 000 DA
                    <span className="text-sm font-body font-normal text-muted-foreground">
                      {" "}/ journée
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prix variable selon l'événement
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-2xl shadow-card p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Mois précédent
                </Button>
                <h3 className="font-display text-xl font-semibold text-foreground capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  Mois suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: adjustedStartDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Month days */}
                  {monthDays.map((day) => {
                    const booked = isDateBooked(day);
                    const past = isBefore(day, new Date()) && !isToday(day);
                    const selected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        disabled={booked || past}
                        className={`aspect-square rounded-xl flex items-center justify-center font-medium transition-all ${selected
                          ? "bg-secondary text-secondary-foreground shadow-lg"
                          : booked
                            ? "bg-destructive/10 text-destructive cursor-not-allowed"
                            : past
                              ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                              : isToday(day)
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "hover:bg-secondary/10 text-foreground"
                          }`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/50" />
                  Disponible
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-secondary" />
                  Sélectionné
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive/10" />
                  Réservé
                </div>
              </div>

              {/* Selected Date & CTA */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-secondary/10 rounded-xl border border-secondary/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date sélectionnée</p>
                      <p className="font-medium text-foreground capitalize">
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <Button variant="warm" size="lg" onClick={() => setShowForm(true)}>
                      <PartyPopper className="w-5 h-5" />
                      Demander un devis
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Booking Form Modal */}
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
                    className="bg-card rounded-2xl shadow-hover p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                      Demande de réservation
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/10 rounded-xl mb-4">
                        <p className="text-sm text-muted-foreground">Date sélectionnée</p>
                        <p className="font-medium text-foreground capitalize">
                          {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Nom complet *</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Téléphone *</label>
                        <input
                          type="tel"
                          className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                          placeholder="0555 123 456"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Type d'événement *</label>
                        <select
                          className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                          value={formData.eventType}
                          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        >
                          <option value="">Sélectionnez...</option>
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Nombre d'invités estimé</label>
                        <input
                          type="number"
                          className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                          placeholder="100"
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Message (optionnel)</label>
                        <textarea
                          className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors resize-none"
                          rows={3}
                          placeholder="Précisions sur votre événement..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                          Annuler
                        </Button>
                        <Button
                          variant="warm"
                          className="flex-1"
                          onClick={() => {
                            addNotification();
                            setShowForm(false);
                          }}
                        >
                          Envoyer la demande
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
