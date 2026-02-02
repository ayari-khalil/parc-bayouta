import { useState, useEffect, useRef } from "react";
import { Search, Calendar, Users, Clock, Check, X, Eye, Download, Filter, Trash2, Repeat, Volume2, VolumeX } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  eventReservations,
  events,
  getStatusColor,
  getStatusLabel,
  EventReservation
} from "@/data/mockData";
import { reservationApi, HallReservation, FieldReservation } from "@/lib/api/reservation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { auditApi } from "@/api/auditApi";

const initialFields = [
  { id: 1, name: "Terrain 1" },
  { id: 2, name: "Terrain 2" },
];

type ReservationType = 'field' | 'hall' | 'event';

export default function AdminReservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReservationType>("field");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [fields, setFields] = useState(initialFields);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const [realFieldReservations, setRealFieldReservations] = useState<FieldReservation[]>([]);
  const [selectedFieldRes, setSelectedFieldRes] = useState<FieldReservation | null>(null);
  const [realHallReservations, setRealHallReservations] = useState<HallReservation[]>([]);
  const [selectedHallRes, setSelectedHallRes] = useState<HallReservation | null>(null);
  const [selectedEventRes, setSelectedEventRes] = useState<EventReservation | null>(null);

  const lastHallCount = useRef(0);
  const lastFieldCount = useRef(0);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
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

    fetchInitialData();
    const interval = setInterval(() => {
      fetchHallReservations();
      fetchFieldReservations();
    }, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  const playNotificationSound = () => {
    if (isAudioEnabled && notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(e => console.error("Notification sound failed:", e));
    }
  };

  const fetchInitialData = async () => {
    try {
      const fieldsData = await reservationApi.getFields();
      if (fieldsData.length > 0) {
        setFields(prev => prev.map(f => {
          const dbField = fieldsData.find(df => df.name === f.name);
          return dbField ? { ...f, dbId: dbField.id || (dbField as any)._id } : f;
        }));
      }

      // Initial fetch to set baseline counts
      const [hallData, fieldData] = await Promise.all([
        reservationApi.getAllHallReservations(),
        reservationApi.getAllFieldReservations()
      ]);
      setRealHallReservations(hallData);
      setRealFieldReservations(fieldData);
      lastHallCount.current = hallData.length;
      lastFieldCount.current = fieldData.length;
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const fetchHallReservations = async () => {
    try {
      const data = await reservationApi.getAllHallReservations();

      if (lastHallCount.current > 0 && data.length > lastHallCount.current) {
        playNotificationSound();

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Nouvelle réservation Salle", {
            body: "Une nouvelle demande de réservation pour la salle a été reçue.",
          });
        }

        toast({
          title: "Nouvelle réservation Salle",
          description: "Une nouvelle demande de réservation pour la salle a été reçue.",
          className: "bg-secondary text-white border-none",
        });
      }

      setRealHallReservations(data);
      lastHallCount.current = data.length;
    } catch (error) {
      console.error("Failed to fetch hall reservations:", error);
    }
  };

  const fetchFieldReservations = async () => {
    try {
      const data = await reservationApi.getAllFieldReservations();

      if (lastFieldCount.current > 0 && data.length > lastFieldCount.current) {
        playNotificationSound();

        // Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Nouvelle réservation Terrain", {
            body: "Un nouveau créneau a été réservé sur les terrains.",
          });
        }

        toast({
          title: "Nouvelle réservation Terrain",
          description: "Un nouveau créneau a été réservé sur les terrains.",
          className: "bg-primary text-white border-none",
        });
      }

      setRealFieldReservations(data);
      lastFieldCount.current = data.length;
    } catch (error) {
      console.error("Failed to fetch field reservations:", error);
    }
  };

  // Filter field reservations
  const filteredFieldReservations = realFieldReservations.filter(res => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesDate = !dateFilter || format(new Date(res.date), "yyyy-MM-dd") === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter hall reservations
  const filteredHallReservations = realHallReservations.filter(res => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery) ||
      res.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchesDate = !dateFilter || format(new Date(res.date), "yyyy-MM-dd") === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter event reservations
  const filteredEventReservations = eventReservations.filter(res => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (type: ReservationType, id: string, newStatus: 'confirmed' | 'canceled') => {
    const actionLabel = newStatus === 'confirmed' ? "CONFIRMATION" : "ANNULATION";
    const categoryLabel = type === 'field' ? "Réservations Terrains" : (type === 'hall' ? "Réservations Salle" : "Réservations Événements");

    if (type === 'hall') {
      try {
        const res = realHallReservations.find(r => r.id === id);
        await reservationApi.updateHallReservationStatus(id, newStatus);

        // Record Audit
        await auditApi.recordLog({
          admin: user?.username || "Admin",
          action: actionLabel,
          category: categoryLabel,
          details: `${actionLabel} de la réservation salle pour ${res?.customerName}`
        });

        fetchHallReservations();
        toast({
          title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
          description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès.`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut.",
          variant: "destructive",
        });
      }
    } else if (type === 'field') {
      try {
        const res = realFieldReservations.find(r => (r.id || r._id) === id);
        await reservationApi.updateFieldReservationStatus(id, newStatus);

        // Record Audit
        await auditApi.recordLog({
          admin: user?.username || "Admin",
          action: actionLabel,
          category: categoryLabel,
          details: `${actionLabel} de la réservation terrain pour ${res?.customerName} (${res?.date} ${res?.timeSlot})`
        });

        fetchFieldReservations();
        toast({
          title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
          description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès.`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
        description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès. (Mode Mock)`,
      });
    }
    setSelectedFieldRes(null);
    setSelectedHallRes(null);
    setSelectedEventRes(null);
  };

  const handleDeleteHallReservation = async (reservationId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation définitivement ?")) return;

    try {
      await reservationApi.deleteHallReservation(reservationId);
      fetchHallReservations();
      toast({
        title: "Réservation supprimée",
        description: "La réservation a été supprimée avec succès.",
      });
      setSelectedHallRes(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réservation.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    toast({
      title: "Export en cours",
      description: "Le fichier CSV sera téléchargé dans quelques instants.",
    });
  };

  const getTotalReservations = () => {
    return realFieldReservations.length + realHallReservations.length + eventReservations.length;
  };

  const getPendingReservations = () => {
    return realFieldReservations.filter(r => r.status === 'pending').length +
      realHallReservations.filter(r => r.status === 'pending').length +
      eventReservations.filter(r => r.status === 'pending').length;
  };

  const getTodayReservations = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return realFieldReservations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === today).length +
      realHallReservations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === today).length;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Gestion des Réservations</h1>
              <p className="text-muted-foreground">Suivez et gérez toutes les demandes de réservation</p>
            </div>
            {isAudioEnabled && (
              <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 gap-1 hidden sm:flex">
                <Volume2 className="w-3 h-3" />
                Alertes sonores actives
              </Badge>
            )}
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total réservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalReservations()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{getPendingReservations()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getTodayReservations()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Terrains / Salle / Événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realFieldReservations.length} / {realHallReservations.length} / {eventReservations.length}
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
                    placeholder="Rechercher par nom ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="canceled">Annulé</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto"
              />
              {dateFilter && (
                <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
                  Effacer date
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReservationType)}>
          <TabsList>
            <TabsTrigger value="field">
              Terrains ({filteredFieldReservations.length})
            </TabsTrigger>
            <TabsTrigger value="hall">
              Salle des Fêtes ({filteredHallReservations.length})
            </TabsTrigger>
            <TabsTrigger value="event">
              Événements ({filteredEventReservations.length})
            </TabsTrigger>
          </TabsList>

          {/* Field Reservations */}
          <TabsContent value="field">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Créneau</TableHead>
                        <TableHead>Terrain</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFieldReservations.map((res) => (
                        <TableRow key={res.id || res._id}>
                          <TableCell>
                            {format(new Date(res.date), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {res.timeSlot}
                            </div>
                          </TableCell>
                          <TableCell>
                            {typeof res.field === 'object'
                              ? res.field.name
                              : (fields.find(f => (f as any).dbId === res.field)?.name || `Terrain ${res.field}`)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{res.customerName}</div>
                              <div className="text-sm text-muted-foreground">{res.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(res.status)}>
                              {getStatusLabel(res.status)}
                            </Badge>
                            {res.isRecurring && (
                              <Repeat className="w-3 h-3 ml-1 text-primary inline" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedFieldRes(res)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {res.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    onClick={() => handleStatusChange('field', res.id || res._id || "", 'confirmed')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleStatusChange('field', res.id || res._id || "", 'canceled')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFieldReservations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune réservation trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hall Reservations */}
          <TabsContent value="hall">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type d'événement</TableHead>
                        <TableHead>Invités</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHallReservations.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell>
                            {format(new Date(res.date), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{res.customerName}</div>
                              <div className="text-sm text-muted-foreground">{res.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{res.eventType}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {res.guestCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(res.status)}>
                              {getStatusLabel(res.status)}
                            </Badge>
                            {res.isRecurring && (
                              <Repeat className="w-3 h-3 ml-1 text-primary inline" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedHallRes(res)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {res.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600"
                                    onClick={() => handleStatusChange('hall', res.id, 'confirmed')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleStatusChange('hall', res.id, 'canceled')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteHallReservation(res.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredHallReservations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune réservation trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Reservations */}
          <TabsContent value="event">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Événement</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Réservé le</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventReservations.map((res) => {
                        const event = events.find(e => e.id === res.eventId);
                        return (
                          <TableRow key={res.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{event?.title || 'Événement inconnu'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {event && format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{res.customerName}</div>
                                <div className="text-sm text-muted-foreground">{res.customerPhone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {res.attendees}
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(res.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(res.status)}>
                                {getStatusLabel(res.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedEventRes(res)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {res.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600"
                                      onClick={() => handleStatusChange('event', res.id, 'confirmed')}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => handleStatusChange('event', res.id, 'canceled')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredEventReservations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune réservation trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Field Reservation Details Dialog */}
        <Dialog open={!!selectedFieldRes} onOpenChange={() => setSelectedFieldRes(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {selectedFieldRes && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client</Label>
                    <p className="font-medium">{selectedFieldRes.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedFieldRes.customerPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedFieldRes.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Créneau</Label>
                    <p className="font-medium">{selectedFieldRes.timeSlot}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Terrain</Label>
                    <p className="font-medium">
                      {typeof selectedFieldRes.field === 'object'
                        ? selectedFieldRes.field.name
                        : (fields.find(f => (f as any).dbId === selectedFieldRes.field)?.name || `Terrain ${selectedFieldRes.field}`)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge className={getStatusColor(selectedFieldRes.status)}>
                      {getStatusLabel(selectedFieldRes.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedFieldRes?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('field', selectedFieldRes.id || selectedFieldRes._id || "", 'canceled')}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('field', selectedFieldRes.id || selectedFieldRes._id || "", 'confirmed')}
                  >
                    Confirmer
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hall Reservation Details Dialog */}
        <Dialog open={!!selectedHallRes} onOpenChange={() => setSelectedHallRes(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {selectedHallRes && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client</Label>
                    <p className="font-medium">{selectedHallRes.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedHallRes.customerPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedHallRes.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type d'événement</Label>
                    <p className="font-medium">{selectedHallRes.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nombre d'invités</Label>
                    <p className="font-medium">{selectedHallRes.guestCount} personnes</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge className={getStatusColor(selectedHallRes.status)}>
                      {getStatusLabel(selectedHallRes.status)}
                    </Badge>
                  </div>
                </div>
                {selectedHallRes.message && (
                  <div>
                    <Label className="text-muted-foreground">Message</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedHallRes.message}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedHallRes?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('hall', selectedHallRes.id, 'canceled')}
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('hall', selectedHallRes.id, 'confirmed')}
                  >
                    Confirmer
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeleteHallReservation(selectedHallRes.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Event Reservation Details Dialog */}
        <Dialog open={!!selectedEventRes} onOpenChange={() => setSelectedEventRes(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {selectedEventRes && (
              <div className="space-y-4">
                {(() => {
                  const event = events.find(e => e.id === selectedEventRes.eventId);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Événement</Label>
                        <p className="font-medium">{event?.title}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Client</Label>
                        <p className="font-medium">{selectedEventRes.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Téléphone</Label>
                        <p className="font-medium">{selectedEventRes.customerPhone}</p>
                      </div>
                      {selectedEventRes.customerEmail && (
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          <p className="font-medium">{selectedEventRes.customerEmail}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-muted-foreground">Participants</Label>
                        <p className="font-medium">{selectedEventRes.attendees} personnes</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Statut</Label>
                        <Badge className={getStatusColor(selectedEventRes.status)}>
                          {getStatusLabel(selectedEventRes.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            <DialogFooter>
              {selectedEventRes?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('event', selectedEventRes.id, 'canceled')}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('event', selectedEventRes.id, 'confirmed')}
                  >
                    Confirmer
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
