import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Search, Users, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { events, getCategoryLabel, getCategoryColor, Event } from "@/data/mockData";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

type DateFilter = 'all' | 'upcoming' | 'past';
type CategoryFilter = Event['category'] | 'all';

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'movie', label: 'Cinéma' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'party', label: 'Soirée' },
  { value: 'kids', label: 'Enfants' },
  { value: 'tournament', label: 'Tournoi' },
  { value: 'special', label: 'Spécial' },
];

export default function Events() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return events
      .filter(event => event.isActive)
      .filter(event => {
        // Search filter
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter(event => {
        // Date filter
        const eventDate = parseISO(event.date);
        if (dateFilter === 'upcoming') return isAfter(eventDate, now) || format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        if (dateFilter === 'past') return isBefore(eventDate, now);
        return true;
      })
      .filter(event => {
        // Category filter
        if (categoryFilter !== 'all') return event.category === categoryFilter;
        return true;
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateFilter === 'past' 
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
  }, [search, dateFilter, categoryFilter]);

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
              Événements
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Nos Événements
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos soirées, tournois et animations pour toute la famille
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background border-b border-border sticky top-16 z-30 backdrop-blur-md bg-background/95">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Date Filter */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setDateFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateFilter === 'upcoming' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  À venir
                </button>
                <button
                  onClick={() => setDateFilter('past')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateFilter === 'past' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Passés
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateFilter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tous
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos filtres ou revenez plus tard.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                const spotsLeft = event.maxCapacity - event.currentReservations;
                const isFull = spotsLeft <= 0;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl overflow-hidden shadow-card card-hover group"
                  >
                    <div className="relative h-48">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getCategoryColor(event.category)}`}>
                          {getCategoryLabel(event.category)}
                        </span>
                        {event.isFeatured && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/90 text-accent-foreground backdrop-blur-sm">
                            À la une
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-primary-foreground text-sm font-medium">
                          {format(parseISO(event.date), "EEEE d MMMM", { locale: fr })} • {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-bold text-foreground mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {isFull ? (
                            <span className="text-destructive">Complet</span>
                          ) : (
                            <span>{spotsLeft} places</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          {event.price.toLocaleString()} DA
                        </span>
                        <Button size="sm" disabled={isFull} asChild>
                          <Link to={`/events/${event.slug}`}>
                            Voir détails
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
