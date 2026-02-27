import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, PartyPopper, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { reservationApi, HallReservation, Hall } from "@/lib/api/reservation";
import { useToast } from "@/hooks/use-toast";
import { sendWhatsAppMessage } from "@/lib/whatsappUtils";
import salle5 from "@/assets/gallery/salle/salle-1.jpg";
import salle2 from "@/assets/gallery/salle/salle-2.jpg";
import salle3 from "@/assets/gallery/salle/salle-3.jpg";
import salle4 from "@/assets/gallery/salle/salle-4.jpg";
import salle1 from "@/assets/gallery/salle/salle-5.jpg";
import { Maximize2, X as CloseIcon, Building2, Castle } from "lucide-react";

const galleryImages = [
  { src: salle1, alt: "Salle des fêtes - Vue d'ensemble" },
  { src: salle2, alt: "Salle des fêtes - Décoration table" },
  { src: salle3, alt: "Salle des fêtes - Espace lounge" },
  { src: salle4, alt: "Salle des fêtes - Banquet" },
  { src: salle5, alt: "Salle des fêtes - Scène" },
];

const eventTypes = [
  "Mariage",
  "Fiançailles",
  "Anniversaire",
  "Baptême",
  "Réunion d'entreprise",
  "Autre",
];

export default function EventHall() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [existingReservations, setExistingReservations] = useState<HallReservation[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "",
    guests: "",
    message: "",
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeHalls = async () => {
      try {
        const hallData = await reservationApi.getHalls();
        setHalls(hallData);
        if (hallData.length > 0) {
          setSelectedHall(hallData[0].id || hallData[0]._id!);
        }
      } catch (error) {
        console.error("Failed to fetch halls:", error);
      }
    };
    initializeHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      fetchReservations(selectedHall);
    }
  }, [selectedHall]);

  const fetchReservations = async (hallId: string) => {
    try {
      const data = await reservationApi.getAllHallReservations(hallId);
      setExistingReservations(data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const getReservationForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return existingReservations.find(r => {
      const resDate = format(new Date(r.date), "yyyy-MM-dd");
      return resDate === dateStr && r.status !== 'canceled';
    });
  };

  const isDateBooked = (date: Date) => !!getReservationForDate(date);

  const handleDateClick = (date: Date) => {
    if (!isDateBooked(date) && !isBefore(date, new Date())) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      await reservationApi.createHallReservation({
        hall: selectedHall!,
        date: selectedDate.toISOString(),
        customerName: formData.name,
        customerPhone: formData.phone,
        eventType: formData.eventType,
        guestCount: parseInt(formData.guests) || 0,
        message: formData.message,
      });

      toast({
        title: "Réservation réussie !",
        description: "Votre demande a été enregistrée. Nous vous contacterons bientôt.",
      });

      // Send WhatsApp Notification to Admin
      sendWhatsAppMessage({
        type: `Salle des Fêtes - ${halls.find(h => (h.id === selectedHall || h._id === selectedHall))?.name || ''}`,
        name: formData.name,
        phone: formData.phone,
        date: format(selectedDate, "dd/MM/yyyy"),
        guests: formData.guests,
        message: formData.message,
      });

      setShowForm(false);
      setSelectedDate(null);
      setFormData({ name: "", phone: "", eventType: "", guests: "", message: "" });
      fetchReservations(selectedHall!);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">
              Événementiel
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Salle des Fêtes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un espace élégant et modulable pour tous vos événements importants
            </p>

            {/* Hall Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {halls.map((hall, index) => {
                const hallId = hall.id || hall._id;
                const isActive = selectedHall === hallId;
                const Icon = index === 0 ? Building2 : Castle;

                return (
                  <Button
                    key={hallId}
                    variant={isActive ? "secondary" : "outline"}
                    className={`h-14 px-8 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${isActive
                      ? "shadow-lg scale-105 bg-secondary text-secondary-foreground"
                      : "bg-background/50 hover:bg-secondary/10 border-secondary/20"
                      }`}
                    onClick={() => {
                      setSelectedHall(hallId!);
                      setSelectedDate(null);
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : 'text-secondary'}`} />
                    <span className="uppercase tracking-wider">{hall.name}</span>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Salle Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-card sticky top-24">
                {/* Image Gallery */}
                <div className="relative group aspect-[4/3] overflow-hidden bg-muted">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={galleryImages[activeImageIndex].src}
                    alt={galleryImages[activeImageIndex].alt}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Enlarge Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {galleryImages.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImageIndex ? "bg-white w-4" : "bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                </div>

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
                      4000 TND
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
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">Vérifier la disponibilité</h2>
                <p className="text-muted-foreground">Sélectionnez une date pour votre événement et demandez un devis gratuit.</p>
                {/* Month Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                    className="w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Mois</span> préc.
                  </Button>
                  <h3 className="font-display text-xl font-semibold text-foreground capitalize order-first sm:order-none">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden xs:inline">Mois</span> suiv.
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="mb-6">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from({ length: adjustedStartDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {monthDays.map((day) => {
                      const reservation = getReservationForDate(day);
                      const booked = !!reservation;
                      const isBlocked = reservation?.status === 'blocked';
                      const past = isBefore(day, new Date()) && !isToday(day);
                      const selected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => handleDateClick(day)}
                          disabled={booked || past}
                          title={isBlocked ? "Date réservée/Indisponible" : booked ? "Déjà réservé" : ""}
                          className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base font-medium transition-all ${selected
                            ? "bg-secondary text-secondary-foreground shadow-lg"
                            : isBlocked
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
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
            className="bg-card rounded-2xl shadow-hover p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Demande de réservation
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  required
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
                  required
                  className="w-full mt-1 p-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                  placeholder="0555 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Type d'événement *</label>
                <select
                  required
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="warm" className="flex-1">
                  Envoyer la demande
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )
      }

      {/* Lightbox */}
      {
        isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white hover:bg-white/10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <CloseIcon className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-6 text-white hover:bg-white/10 hidden md:flex"
              onClick={prevImage}
            >
              <ChevronLeft className="h-12 w-12" />
            </Button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={galleryImages[activeImageIndex].src}
              alt={galleryImages[activeImageIndex].alt}
              className="max-w-full max-h-[90vh] object-contain px-4"
              onClick={(e) => e.stopPropagation()}
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-6 text-white hover:bg-white/10 hidden md:flex"
              onClick={nextImage}
            >
              <ChevronRight className="h-12 w-12" />
            </Button>

            {/* Lightbox Navigation for Mobile */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="hover:bg-white/10"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <span className="text-sm font-medium">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="hover:bg-white/10"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </motion.div>
        )
      }
    </PublicLayout >
  );
}
