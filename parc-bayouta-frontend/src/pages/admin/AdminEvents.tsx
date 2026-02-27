import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Calendar, Users, Ticket, Star, StarOff, Loader2, ImageIcon, X } from "lucide-react";
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
import { eventApi, Event, EventReservation } from "@/api/dashboardApi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { auditApi } from "@/api/auditApi";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { value: 'movie', label: 'Cinéma' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'party', label: 'Soirée' },
  { value: 'kids', label: 'Enfants' },
  { value: 'tournament', label: 'Tournoi' },
  { value: 'special', label: 'Spécial' },
];

export const getCategoryLabel = (category: string) => {
  return categories.find(c => c.value === category)?.label || category;
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'movie': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'gaming': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'party': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
    case 'kids': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'tournament': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

export default function AdminEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<EventReservation[]>([]);
  const [loading, setLoading] = useState(true);
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
    image: "",
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
  const [imageUploading, setImageUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      setImageUploading(true);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return `${API_URL}${data.url}`;
    } catch (e) {
      toast({ title: 'Erreur', description: "Impossible de télécharger l'image.", variant: 'destructive' });
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // View reservations dialog
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  // Delete confirmation
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, resData] = await Promise.all([
        eventApi.getEvents(),
        eventApi.getReservations()
      ]);
      setEvents(eventsData);
      setReservations(resData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        longDescription: event.longDescription || "",
        image: event.image || "",
        date: event.date,
        time: event.time,
        endTime: event.endTime || "",
        category: event.category,
        price: event.price.toString(),
        maxCapacity: event.maxCapacity.toString(),
        location: event.location,
        isActive: event.isActive,
        isFeatured: event.isFeatured || false
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: "",
        description: "",
        longDescription: "",
        image: "",
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

  const handleSaveEvent = async () => {
    try {
      const payload = {
        ...eventForm,
        slug: eventForm.title.toLowerCase().replace(/\s+/g, '-'),
        price: Number(eventForm.price),
        maxCapacity: Number(eventForm.maxCapacity),
      };

      if (editingEvent) {
        await eventApi.updateEvent(editingEvent._id || editingEvent.id, payload);
      } else {
        await eventApi.createEvent(payload);
      }

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: editingEvent ? "MODIFICATION" : "CRÉATION",
        category: "Événements",
        details: `${editingEvent ? "Modification" : "Création"} de l'événement "${eventForm.title}"`
      });

      toast({
        title: editingEvent ? "Événement modifié" : "Événement créé",
        description: `L'événement "${eventForm.title}" a été enregistré avec succès.`,
      });
      setShowEventDialog(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'événement.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await eventApi.updateEvent(event._id || event.id, { isFeatured: !event.isFeatured });
      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Événements",
        details: `${!event.isFeatured ? "Mise en avant" : "Retrait de la mise en avant"} de l'événement "${event.title}"`
      });
      fetchData();
      toast({
        title: !event.isFeatured ? "Ajouté aux featured" : "Retiré des featured",
        description: `L'événement "${event.title}" a été mis à jour.`,
      });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleToggleActive = async (event: Event) => {
    try {
      await eventApi.updateEvent(event._id || event.id, { isActive: !event.isActive });
      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Événements",
        details: `${!event.isActive ? "Activation" : "Désactivation"} de l'événement "${event.title}"`
      });
      fetchData();
      toast({
        title: !event.isActive ? "Activé" : "Désactivé",
        description: `L'événement "${event.title}" a été mis à jour.`,
      });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      const event = events.find(e => (e._id || e.id) === deleteEventId);
      await eventApi.deleteEvent(deleteEventId);
      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Événements",
        details: `Suppression de l'événement "${event?.title}"`
      });
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
      setDeleteEventId(null);
      fetchData();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const getEventReservations = (eventId: string) => {
    return reservations.filter(r => {
      const id = typeof r.event === 'string' ? r.event : (r.event._id || r.event.id);
      return id === eventId;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
                {events.reduce((acc, e) => acc + (e.currentReservations || 0), 0)}
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
            <div className="overflow-x-auto">
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
                    <TableRow key={event._id || event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          {event.isFeatured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                          <div>
                            <div className="font-medium truncate max-w-[150px]">{event.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div className="whitespace-nowrap">
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
                      <TableCell className="font-medium whitespace-nowrap">{event.price} DA</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
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
                            onClick={() => setDeleteEventId(event._id || event.id)}
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
            </div>
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
                {/* Image Upload */}
                <div className="col-span-2 space-y-2">
                  <Label>Image de l'événement</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border flex-shrink-0">
                      {eventForm.image ? (
                        <>
                          <img src={eventForm.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEventForm({ ...eventForm, image: '' })}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors">
                          {imageUploading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</>
                          ) : (
                            <><ImageIcon className="w-4 h-4" /> Choisir une image</>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={imageUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) setEventForm({ ...eventForm, image: url });
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="Titre de l'événement"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description courte</Label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Description courte pour les cartes..."
                    rows={2}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description complète</Label>
                  <Textarea
                    value={eventForm.longDescription}
                    onChange={(e) => setEventForm({ ...eventForm, longDescription: e.target.value })}
                    placeholder="Description détaillée de l'événement..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={eventForm.category}
                    onValueChange={(v) => setEventForm({ ...eventForm, category: v as Event['category'] })}
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
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix (DA)</Label>
                  <Input
                    type="number"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacité max</Label>
                  <Input
                    type="number"
                    value={eventForm.maxCapacity}
                    onChange={(e) => setEventForm({ ...eventForm, maxCapacity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Lieu</Label>
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Ex: Salle des fêtes, Terrain 1..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={eventForm.isActive}
                    onCheckedChange={(checked) => setEventForm({ ...eventForm, isActive: checked })}
                  />
                  <Label>Événement actif</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={eventForm.isFeatured}
                    onCheckedChange={(checked) => setEventForm({ ...eventForm, isFeatured: checked })}
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
                  {getEventReservations(viewingEvent._id || viewingEvent.id).map((res) => (
                    <TableRow key={res._id || res.id}>
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
                  {getEventReservations(viewingEvent._id || viewingEvent.id).length === 0 && (
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
