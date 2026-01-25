import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { fields, timeSlots, fieldReservations } from "@/data/mockData";
import terrainImg from "@/assets/terrain-foot.jpg";
import { useToast } from "@/hooks/use-toast";

export default function Fields() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTerrain, setSelectedTerrain] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const { toast } = useToast();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isSlotBooked = (date: Date, terrainId: number, slot: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return fieldReservations.some(
      r => r.date === dateStr && r.fieldId === terrainId && r.timeSlot === slot && r.status !== 'canceled'
    );
  };

  const isSlotPast = (date: Date, slot: string) => {
    if (!isToday(date)) return isBefore(date, new Date());
    const [hours] = slot.split(":").map(Number);
    const now = new Date();
    return hours <= now.getHours();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Réservation envoyée !",
      description: "Nous vous contacterons pour confirmer votre réservation.",
    });
    setShowForm(false);
    setSelectedSlot(null);
    setFormData({ name: "", phone: "" });
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
              Mini-Foot
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Réservez votre terrain
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deux terrains professionnels équipés pour vos matchs et entraînements
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Terrain Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-card sticky top-24">
                <img
                  src={terrainImg}
                  alt="Terrain de mini-foot"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    Nos Terrains
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      Gazon synthétique dernière génération
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      Éclairage LED puissant
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      Vestiaires et douches
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      Parking gratuit
                    </li>
                  </ul>
                  <div className="mt-6 p-4 bg-primary/10 rounded-xl">
                    <p className="text-sm text-foreground font-medium">Tarif</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      3 000 DA
                      <span className="text-sm font-body font-normal text-muted-foreground">
                        {" "}/ 1h30
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Booking Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl shadow-card p-6">
                {/* Terrain Selection */}
                <div className="flex gap-4 mb-6">
                  {fields.map((terrain) => (
                    <button
                      key={terrain.id}
                      onClick={() => {
                        setSelectedTerrain(terrain.id);
                        setSelectedSlot(null);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        selectedTerrain === terrain.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <MapPin className={`w-5 h-5 mb-2 ${selectedTerrain === terrain.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`font-medium ${selectedTerrain === terrain.id ? 'text-primary' : 'text-foreground'}`}>
                        {terrain.name}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Week Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Semaine</span> préc.
                  </Button>
                  <span className="font-medium text-foreground capitalize order-first sm:order-none">
                    {format(weekStart, "MMMM yyyy", { locale: fr })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden xs:inline">Semaine</span> suiv.
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Day Selection */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
                  {weekDays.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlot(null);
                      }}
                      disabled={isBefore(day, new Date()) && !isToday(day)}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-center transition-all ${
                        isSameDay(day, selectedDate)
                          ? "bg-primary text-primary-foreground"
                          : isBefore(day, new Date()) && !isToday(day)
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-muted/50 hover:bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-[10px] sm:text-xs uppercase opacity-70">
                        {format(day, "EEE", { locale: fr })}
                      </p>
                      <p className="text-base sm:text-lg font-semibold">{format(day, "d")}</p>
                    </button>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">
                      Créneaux disponibles - {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {timeSlots.map((slot) => {
                      const booked = isSlotBooked(selectedDate, selectedTerrain, slot.time);
                      const past = isSlotPast(selectedDate, slot.time);
                      const disabled = booked || past;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => !disabled && setSelectedSlot(slot.time)}
                          disabled={disabled}
                          className={`p-3 rounded-xl text-center font-medium transition-all ${
                            selectedSlot === slot.time
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : booked
                              ? "bg-destructive/10 text-destructive line-through cursor-not-allowed"
                              : past
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-muted/50 hover:bg-primary/10 text-foreground hover:text-primary"
                          }`}
                        >
                          {slot.time}
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
                    <div className="w-4 h-4 rounded bg-primary" />
                    Sélectionné
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive/10" />
                    Réservé
                  </div>
                </div>

                {/* Selected Summary & CTA */}
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/5 rounded-xl border border-primary/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Votre sélection</p>
                        <p className="font-medium text-foreground">
                          {fields.find(t => t.id === selectedTerrain)?.name} • {format(selectedDate, "EEEE d MMMM", { locale: fr })} • {selectedSlot}
                        </p>
                      </div>
                      <Button variant="hero" size="lg" onClick={() => setShowForm(true)}>
                        <Calendar className="w-5 h-5" />
                        Réserver maintenant
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
            className="bg-card rounded-2xl shadow-hover p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Confirmer la réservation
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">Récapitulatif</p>
                <p className="font-medium text-foreground">
                  {fields.find(t => t.id === selectedTerrain)?.name}
                </p>
                <p className="text-foreground">
                  {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })} à {selectedSlot}
                </p>
                <p className="text-primary font-bold mt-2">3 000 DA</p>
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
