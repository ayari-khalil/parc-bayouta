import { useState, useEffect } from "react";
import { Calendar, Users, PartyPopper, CalendarDays, TrendingUp, Clock, History, User, Volume2, VolumeX } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { reservationApi, HallReservation, FieldReservation } from "@/lib/api/reservation";
import { getTodayVisits } from "@/api/analyticsApi";
import { eventApi, messageApi, Event, ContactMessage } from "@/api/dashboardApi";
import { auditApi, AuditLog } from "@/api/auditApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

export default function AdminDashboard() {
  const [realHallReservations, setRealHallReservations] = useState<HallReservation[]>([]);
  const [fieldReservations, setFieldReservations] = useState<FieldReservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [todayVisits, setTodayVisits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const { toast } = useToast();

  const lastHallCount = useRef(0);
  const lastFieldCount = useRef(0);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // New louder chime sound
    notificationSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

    // Request Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Auto-unlock audio on first user interaction
    const unlockAudio = () => {
      if (notificationSound.current) {
        notificationSound.current.volume = 0;
        notificationSound.current.play().then(() => {
          notificationSound.current!.volume = 1.0;
          setIsAudioEnabled(true);
          window.removeEventListener('click', unlockAudio);
          console.log("Audio context unlocked automatically");
        }).catch(e => console.log("Unlock failed:", e));
      }
    };
    window.addEventListener('click', unlockAudio);

    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(e => console.error("Notification sound failed:", e));
    }
  };

  const fetchAllData = async () => {
    try {
      const [hallRes, fieldRes, evs, msgs, visits, logs] = await Promise.all([
        reservationApi.getAllHallReservations(),
        reservationApi.getAllFieldReservations(),
        eventApi.getEvents(),
        messageApi.getMessages(),
        getTodayVisits(),
        auditApi.getLogs()
      ]);

      // Check for new reservations to play sound
      if (lastHallCount.current > 0 && hallRes.length > lastHallCount.current) {
        playNotificationSound();

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Nouvelle réservation Salle", {
            body: "Une nouvelle demande de réservation pour la salle a été reçue.",
            icon: "/favicon.ico" // assuming there is one
          });
        }

        toast({
          title: "Nouvelle réservation Salle",
          description: "Une nouvelle demande de réservation pour la salle a été reçue.",
          className: "bg-secondary text-white border-none",
        });
      }

      if (lastFieldCount.current > 0 && fieldRes.length > lastFieldCount.current) {
        playNotificationSound();

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Nouvelle réservation Terrain", {
            body: "Un nouveau créneau a été réservé sur les terrains.",
            icon: "/favicon.ico"
          });
        }

        toast({
          title: "Nouvelle réservation Terrain",
          description: "Un nouveau créneau a été réservé sur les terrains.",
          className: "bg-primary text-white border-none",
        });
      }

      setRealHallReservations(hallRes);
      setFieldReservations(fieldRes);
      setEvents(evs);
      setMessages(msgs);
      setTodayVisits(visits.count);
      setAuditLogs(logs);

      lastHallCount.current = hallRes.length;
      lastFieldCount.current = fieldRes.length;
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
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Tableau de bord</h1>
              <p className="text-muted-foreground text-sm sm:base">Vue d'ensemble de votre activité</p>
            </div>
            {isAudioEnabled && (
              <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 gap-1 hidden sm:flex">
                <Volume2 className="w-3 h-3" />
                Alertes sonores actives
              </Badge>
            )}
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historique des actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
                  <PartyPopper className="w-5 h-5 text-secondary" />
                  Dernières réservations salle
                </h2>
                <div className="space-y-3">
                  {realHallReservations.length > 0 ? (
                    [...realHallReservations]
                      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                      .slice(0, 5)
                      .map((res) => (
                        <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{res.customerName}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {res.eventType} • {format(new Date(res.date), "dd MMM yyyy", { locale: fr })}
                            </p>
                          </div>
                          <span className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${res.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                            res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                              res.status === 'blocked' ? 'bg-gray-500/10 text-gray-600' :
                                'bg-red-500/10 text-red-600'
                            }`}>
                            {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : res.status === 'blocked' ? 'Bloqué' : 'Annulé'}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-center py-8 text-muted-foreground text-sm italic">Aucune réservation de salle récente</p>
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
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft border border-border/50">
              <div className="space-y-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id || log._id} className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <p className="font-bold text-foreground truncate">
                            {log.admin}
                            <span className="font-normal text-muted-foreground mx-2">a effectué une action :</span>
                            <span className="text-primary">{log.action}</span>
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: fr })}
                          </p>
                        </div>
                        <p className="text-sm text-foreground mb-1">{log.details}</p>
                        <Badge variant="outline" className="text-[10px] py-0">{log.category}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Aucun historique d'action disponible</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}


