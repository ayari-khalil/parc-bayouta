import { Calendar, Users, PartyPopper, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { fieldReservations, hallReservations, events, eventReservations, contactMessages } from "@/data/mockData";

const stats = [
  { label: "Réservations terrains", value: fieldReservations.length, icon: Calendar, color: "text-primary" },
  { label: "Réservations salle", value: hallReservations.length, icon: PartyPopper, color: "text-secondary" },
  { label: "Événements actifs", value: events.filter(e => e.isActive).length, icon: CalendarDays, color: "text-accent" },
  { label: "Messages non lus", value: contactMessages.filter(m => m.status === 'new').length, icon: Users, color: "text-destructive" },
];

const recentReservations = [...fieldReservations].sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
).slice(0, 5);

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Dernières réservations terrains
            </h2>
            <div className="space-y-3">
              {recentReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{res.customerName}</p>
                    <p className="text-sm text-muted-foreground">Terrain {res.fieldId} • {res.date} à {res.timeSlot}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    res.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                    res.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Événements à venir
            </h2>
            <div className="space-y-3">
              {events.filter(e => e.isActive).slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date} • {event.currentReservations}/{event.maxCapacity} inscrits</p>
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(event.currentReservations / event.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
