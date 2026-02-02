import { useState, useEffect } from "react";
import { Calendar, Users, PartyPopper, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { reservationApi, HallReservation, FieldReservation } from "@/lib/api/reservation";
import { getTodayVisits } from "@/api/analyticsApi";
import { eventApi, messageApi, Event, ContactMessage } from "@/api/dashboardApi";

export default function AdminDashboard() {
  const [realHallReservations, setRealHallReservations] = useState<HallReservation[]>([]);
  const [fieldReservations, setFieldReservations] = useState<FieldReservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [todayVisits, setTodayVisits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [hallRes, fieldRes, evs, msgs, visits] = await Promise.all([
        reservationApi.getAllHallReservations(),
        reservationApi.getAllFieldReservations(),
        eventApi.getEvents(),
        messageApi.getMessages(),
        getTodayVisits()
      ]);

      setRealHallReservations(hallRes);
      setFieldReservations(fieldRes);
      setEvents(evs);
      setMessages(msgs);
      setTodayVisits(visits.count);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: "Visites aujourd'hui", value: todayVisits, icon: TrendingUp, color: "text-blue-500" },
    { label: "Réservations terrains", value: fieldReservations.length, icon: Calendar, color: "text-primary" },
    { label: "Réservations salle", value: realHallReservations.length, icon: PartyPopper, color: "text-secondary" },
    { label: "Messages non lus", value: messages.filter(m => m.status === 'new').length, icon: Users, color: "text-destructive" },
  ];

  const recentFieldReservations = [...fieldReservations].sort((a, b) =>
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  ).slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground text-sm sm:base">Vue d'ensemble de votre activité</p>
          </div>
          {isLoading && <span className="text-xs text-primary animate-pulse font-medium">Mise à jour...</span>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 sm:p-5 shadow-soft border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isLoading && stat.value === 0 ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50 h-full">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Derniers terrains
            </h2>
            <div className="space-y-3">
              {recentFieldReservations.length > 0 ? (
                recentFieldReservations.map((res) => (
                  <div key={res._id || res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{res.customerName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Terrain {(res.field as any)?.name || res.fieldId || 'N/A'} • {res.date} à {res.timeSlot}
                      </p>
                    </div>
                    <span className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${res.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                        res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-red-500/10 text-red-600'
                      }`}>
                      {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : 'Annulé'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm italic">Aucune réservation récente</p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50 h-full">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Événements
            </h2>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.filter(e => e.isActive).slice(0, 5).map((event) => (
                  <div key={event._id || event.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground truncate">{event.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap font-medium">
                        {event.currentReservations}/{event.maxCapacity}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min((event.currentReservations / event.maxCapacity) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                      {event.date} • {event.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm italic">Aucun événement actif</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

