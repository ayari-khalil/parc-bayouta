import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Search, Calendar, Users, Ticket, Star, StarOff } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  events, 
  eventReservations, 
  getCategoryLabel, 
  getCategoryColor,
  Event 
} from "@/data/mockData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const categories = [
  { value: 'movie', label: 'Cinéma' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'party', label: 'Soirée' },
  { value: 'kids', label: 'Enfants' },
  { value: 'tournament', label: 'Tournoi' },
  { value: 'special', label: 'Spécial' },
];

export default function AdminEvents() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Event dialog
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    date: "",
    time: "",
    endTime: "",
    category: "movie" as Event['category'],
    price: "",
    maxCapacity: "",
    location: "",
    isActive: true,
    isFeatured: false
  });

  // View reservations dialog
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  // Delete confirmation
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && event.isActive) ||
      (statusFilter === "inactive" && !event.isActive) ||
      (statusFilter === "featured" && event.isFeatured);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openEventDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        longDescription: event.longDescription,
        date: event.date,
        time: event.time,
        endTime: event.endTime || "",
        category: event.category,
        price: event.price.toString(),
        maxCapacity: event.maxCapacity.toString(),
        location: event.location,
        isActive: event.isActive,
        isFeatured: event.isFeatured
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: "",
        description: "",
        longDescription: "",
        date: "",
        time: "",
        endTime: "",
        category: "movie",
        price: "",
        maxCapacity: "",
        location: "",
        isActive: true,
        isFeatured: false
      });
    }
    setShowEventDialog(true);
  };

  const handleSaveEvent = () => {
    toast({
      title: editingEvent ? "Événement modifié" : "Événement créé",
      description: `L'événement "${eventForm.title}" a été ${editingEvent ? 'modifié' : 'créé'} avec succès.`,
    });
    setShowEventDialog(false);
    setEditingEvent(null);
  };

  const handleToggleFeatured = (event: Event) => {
    toast({
      title: event.isFeatured ? "Retiré des featured" : "Ajouté aux featured",
      description: `L'événement "${event.title}" ${event.isFeatured ? 'n\'est plus' : 'est maintenant'} mis en avant.`,
    });
  };

  const handleToggleActive = (event: Event) => {
    toast({
      title: event.isActive ? "Événement désactivé" : "Événement activé",
      description: `L'événement "${event.title}" a été ${event.isActive ? 'désactivé' : 'activé'}.`,
    });
  };

  const handleDeleteEvent = () => {
    toast({
      title: "Événement supprimé",
      description: "L'événement a été supprimé avec succès.",
    });
    setDeleteEventId(null);
  };

  const getEventReservations = (eventId: string) => {
    return eventReservations.filter(r => r.eventId === eventId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Gestion des Événements</h1>
            <p className="text-muted-foreground">Créez et gérez les événements publics</p>
          </div>
          <Button onClick={() => openEventDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Événements actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mis en avant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {events.filter(e => e.isFeatured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Réservations totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((acc, e) => acc + e.currentReservations, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un événement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Événements ({filteredEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Réservations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {event.isFeatured && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div>{format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}</div>
                          <div className="text-sm text-muted-foreground">{event.time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(event.category)}>
                        {getCategoryLabel(event.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{event.price} DA</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.currentReservations} / {event.maxCapacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={event.isActive}
                        onCheckedChange={() => handleToggleActive(event)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFeatured(event)}
                          title={event.isFeatured ? "Retirer des featured" : "Mettre en avant"}
                        >
                          {event.isFeatured ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingEvent(event)}
                          title="Voir les réservations"
                        >
                          <Ticket className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEventDialog(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteEventId(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun événement trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    placeholder="Titre de l'événement"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description courte</Label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Description courte pour les cartes..."
                    rows={2}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description complète</Label>
                  <Textarea
                    value={eventForm.longDescription}
                    onChange={(e) => setEventForm({...eventForm, longDescription: e.target.value})}
                    placeholder="Description détaillée de l'événement..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={eventForm.category} 
                    onValueChange={(v) => setEventForm({...eventForm, category: v as Event['category']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix (DA)</Label>
                  <Input
                    type="number"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacité max</Label>
                  <Input
                    type="number"
                    value={eventForm.maxCapacity}
                    onChange={(e) => setEventForm({...eventForm, maxCapacity: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Lieu</Label>
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    placeholder="Ex: Salle des fêtes, Terrain 1..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={eventForm.isActive}
                    onCheckedChange={(checked) => setEventForm({...eventForm, isActive: checked})}
                  />
                  <Label>Événement actif</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={eventForm.isFeatured}
                    onCheckedChange={(checked) => setEventForm({...eventForm, isFeatured: checked})}
                  />
                  <Label>Mettre en avant</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEvent}>
                {editingEvent ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Reservations Dialog */}
        <Dialog open={!!viewingEvent} onOpenChange={() => setViewingEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Réservations - {viewingEvent?.title}</DialogTitle>
              <DialogDescription>
                {viewingEvent?.currentReservations} / {viewingEvent?.maxCapacity} places réservées
              </DialogDescription>
            </DialogHeader>
            {viewingEvent && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getEventReservations(viewingEvent.id).map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">{res.customerName}</TableCell>
                      <TableCell>{res.customerPhone}</TableCell>
                      <TableCell>{res.customerEmail || '-'}</TableCell>
                      <TableCell>{res.attendees}</TableCell>
                      <TableCell>
                        <Badge variant={res.status === 'confirmed' ? 'default' : 'secondary'}>
                          {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : 'Annulé'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {getEventReservations(viewingEvent.id).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucune réservation pour cet événement
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet événement ? Cette action supprimera également toutes les réservations associées.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEventId(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
