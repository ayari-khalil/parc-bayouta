import { useState, useEffect, useRef } from "react";
import { Search, Calendar, Users, Clock, Check, X, Eye, Download, Filter, Trash2, Repeat, Volume2, VolumeX, Loader2, Building2, Castle, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  getStatusColor,
  getStatusLabel,
  EventReservation
} from "@/data/mockData";
import { eventApi, Event, EventReservation as RealEventRes } from "@/api/dashboardApi";
import { reservationApi, HallReservation, FieldReservation, Hall } from "@/lib/api/reservation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { auditApi } from "@/api/auditApi";

const initialFields = [
  { id: 1, name: "Terrain 1" },
  { id: 2, name: "Terrain 2" },
];

type ReservationType = 'field' | 'hall' | 'event';
type ExportRange = '7days' | '30days' | 'year' | 'all';

export default function AdminReservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReservationType>("field");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [fields, setFields] = useState(initialFields);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [realFieldReservations, setRealFieldReservations] = useState<FieldReservation[]>([]);
  const [selectedFieldRes, setSelectedFieldRes] = useState<FieldReservation | null>(null);
  const [realHallReservations, setRealHallReservations] = useState<HallReservation[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallRes, setSelectedHallRes] = useState<HallReservation | null>(null);

  const [realEventReservations, setRealEventReservations] = useState<RealEventRes[]>([]);
  const [realEvents, setRealEvents] = useState<Event[]>([]);
  const [selectedEventRes, setSelectedEventRes] = useState<RealEventRes | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState<ExportRange>("7days");
  const [isExporting, setIsExporting] = useState(false);

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
      fetchEventReservations();
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
      setLoading(true);
      const fieldsData = await reservationApi.getFields();
      if (fieldsData.length > 0) {
        setFields(prev => prev.map(f => {
          const dbField = fieldsData.find(df => df.name === f.name);
          return dbField ? { ...f, dbId: dbField.id || (dbField as any)._id } : f;
        }));
      }

      // Initial fetch to set baseline counts
      const [hallData, fieldData, eventResData, eventsData, hallsData] = await Promise.all([
        reservationApi.getAllHallReservations(),
        reservationApi.getAllFieldReservations(),
        eventApi.getReservations(),
        eventApi.getEvents(),
        reservationApi.getHalls()
      ]);
      setRealHallReservations(hallData);
      setRealFieldReservations(fieldData);
      setRealEventReservations(eventResData);
      setRealEvents(eventsData);
      setHalls(hallsData);
      lastHallCount.current = hallData.length;
      lastFieldCount.current = fieldData.length;
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHallReservations = async () => {
    try {
      const data = await reservationApi.getAllHallReservations();
      if (lastHallCount.current > 0 && data.length > lastHallCount.current) {
        playNotificationSound();
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

  const fetchEventReservations = async () => {
    try {
      const data = await eventApi.getReservations();
      setRealEventReservations(data);
    } catch (error) {
      console.error("Failed to fetch event reservations:", error);
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
  const filteredEventReservations = realEventReservations.filter(res => {
    const event = typeof res.event === 'object' ? res.event : realEvents.find(e => (e._id || e.id) === res.event);
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery) ||
      (event && event.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (type: ReservationType, id: string, newStatus: 'confirmed' | 'canceled') => {
    const actionLabel = newStatus === 'confirmed' ? "CONFIRMATION" : "ANNULATION";
    const categoryLabel = type === 'field' ? "Réservations Terrains" : (type === 'hall' ? "Réservations Salle" : "Réservations Événements");

    try {
      if (type === 'hall') {
        const res = realHallReservations.find(r => r.id === id);
        await reservationApi.updateHallReservationStatus(id, newStatus);

        await auditApi.recordLog({
          admin: user?.username || "Admin",
          action: actionLabel,
          category: categoryLabel,
          details: `${actionLabel} de la réservation salle pour ${res?.customerName}`
        });
        fetchHallReservations();
      } else if (type === 'field') {
        const res = realFieldReservations.find(r => (r.id || r._id) === id);
        await reservationApi.updateFieldReservationStatus(id, newStatus);

        await auditApi.recordLog({
          admin: user?.username || "Admin",
          action: actionLabel,
          category: categoryLabel,
          details: `${actionLabel} de la réservation terrain pour ${res?.customerName}`
        });
        fetchFieldReservations();
      } else if (type === 'event') {
        const res = realEventReservations.find(r => (r._id || r.id) === id);
        await eventApi.updateReservationStatus(id, newStatus);

        await auditApi.recordLog({
          admin: user?.username || "Admin",
          action: actionLabel,
          category: categoryLabel,
          details: `${actionLabel} de la réservation événement pour ${res?.customerName}`
        });
        fetchEventReservations();
      }

      toast({
        title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
        description: `La réservation a été mise à jour avec succès.`,
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
    setSelectedFieldRes(null);
    setSelectedHallRes(null);
    setSelectedEventRes(null);
  };

  const handleDeleteHallReservation = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return;
    try {
      const res = realHallReservations.find(r => r.id === id);
      await reservationApi.deleteHallReservation(id);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Réservations Salle",
        details: `Suppression de la réservation salle pour ${res?.customerName}`
      });

      fetchHallReservations();
      toast({ title: "Réservation supprimée", className: "bg-green-600 text-white border-none" });
      setSelectedHallRes(null);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la réservation.", variant: "destructive" });
    }
  };

  const handleDeleteEventReservation = async (id: string) => {
    if (!window.confirm("Supprimer cette réservation ?")) return;
    try {
      const res = realEventReservations.find(r => (r._id || r.id) === id);
      await eventApi.deleteReservation(id);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Réservations Événements",
        details: `Suppression de la réservation événement pour ${res?.customerName}`
      });

      fetchEventReservations();
      toast({ title: "Supprimé" });
      setSelectedEventRes(null);
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const getTotalReservations = () => {
    return realFieldReservations.length + realHallReservations.length + realEventReservations.length;
  };

  const getPendingReservations = () => {
    return realFieldReservations.filter(r => r.status === 'pending').length +
      realHallReservations.filter(r => r.status === 'pending').length +
      realEventReservations.filter(r => r.status === 'pending').length;
  };

  const getTodayReservations = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return realFieldReservations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === today).length +
      realHallReservations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === today).length;
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      const dateStr = format(new Date(), "dd/MM/yyyy HH:mm");

      // Title & Header
      doc.setFontSize(22);
      doc.setTextColor(22, 101, 52); // primary color
      doc.text("Parc Bayouta - Rapport des Réservations", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le: ${dateStr}`, 14, 28);
      doc.text(`Période: ${exportRange === '7days' ? 'Derniers 7 jours' :
        exportRange === '30days' ? 'Derniers 30 jours' :
          exportRange === 'year' ? 'Dernière année' : 'Toutes les réservations'}`, 14, 34);

      let currentY = 45;

      const now = new Date();
      const filterByRange = (date: Date) => {
        if (exportRange === 'all') return true;
        const resDate = new Date(date);
        const diffDays = Math.floor((now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24));

        if (exportRange === '7days') return diffDays <= 7;
        if (exportRange === '30days') return diffDays <= 30;
        if (exportRange === 'year') return diffDays <= 365;
        return true;
      };

      // 1. TERRAINS
      const fieldData = realFieldReservations
        .filter(r => filterByRange(new Date(r.date)))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(r => [
          format(new Date(r.date), "dd/MM/yyyy"),
          r.timeSlot,
          typeof r.field === 'object' ? r.field.name : (fields.find(f => (f as any).dbId === r.field)?.name || `Terrain ${r.field}`),
          r.customerName,
          r.customerPhone,
          getStatusLabel(r.status)
        ]);

      if (fieldData.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Réservations Terrains de Football", 14, currentY);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Date', 'Créneau', 'Terrain', 'Client', 'Téléphone', 'Statut']],
          body: fieldData,
          theme: 'grid',
          headStyles: { fillColor: [22, 101, 52] },
          margin: { top: 10 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 2. SALLE DES FETES
      if (currentY > 250) { doc.addPage(); currentY = 20; }

      const hallData = realHallReservations
        .filter(r => filterByRange(new Date(r.date)))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(r => {
          const hallId = typeof r.hall === 'string' ? r.hall : (r.hall as any)?.id || (r.hall as any)?._id;
          const hallIndex = halls.findIndex(h => (h.id === hallId || h._id === hallId));
          const hallName = typeof r.hall === 'string'
            ? (halls.find(h => h.id === r.hall || h._id === r.hall)?.name || 'Salle')
            : r.hall?.name || 'Salle';

          return [
            format(new Date(r.date), "dd/MM/yyyy"),
            `Salle ${hallIndex + 1} (${hallName})`,
            r.customerName,
            r.eventType,
            r.guestCount,
            getStatusLabel(r.status)
          ];
        });

      if (hallData.length > 0) {
        doc.setFontSize(14);
        doc.text("Réservations Salle des Fêtes", 14, currentY);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Date', 'Salle', 'Client', 'Type', 'Invités', 'Statut']],
          body: hallData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }, // Indigo
          margin: { top: 10 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 3. EVENEMENTS
      if (currentY > 250) { doc.addPage(); currentY = 20; }

      const eventData = realEventReservations
        .filter(r => filterByRange(new Date(r.createdAt)))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(r => {
          const event = typeof r.event === 'object' ? r.event : realEvents.find(e => (e._id || e.id) === r.event);
          return [
            event?.title || 'Événement',
            r.customerName,
            r.customerPhone,
            r.attendees,
            format(new Date(r.createdAt), "dd/MM/yyyy"),
            getStatusLabel(r.status)
          ];
        });

      if (eventData.length > 0) {
        doc.setFontSize(14);
        doc.text("Réservations Événements Spéciaux", 14, currentY);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Événement', 'Client', 'Téléphone', 'Participants', 'Date Réserv.', 'Statut']],
          body: eventData,
          theme: 'grid',
          headStyles: { fillColor: [219, 39, 119] }, // Pink
          margin: { top: 10 },
        });
      }

      const filename = `Rapport_Reservations_Bayouta_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
      doc.save(filename);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Réservations",
        details: `Export PDF des réservations (${exportRange})`
      });

      toast({
        title: "Export réussi",
        description: `Le rapport a été téléchargé sous le nom ${filename}`,
      });
      setShowExportDialog(false);
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le fichier PDF.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
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
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
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
                {realFieldReservations.length} / {realHallReservations.length} / {realEventReservations.length}
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
                        <TableHead>Salle</TableHead>
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
                            {(() => {
                              const hallId = typeof res.hall === 'string' ? res.hall : (res.hall as any)?.id || (res.hall as any)?._id;
                              const hallIndex = halls.findIndex(h => (h.id === hallId || h._id === hallId));
                              const hallNumber = hallIndex !== -1 ? hallIndex + 1 : 1;
                              const HallIcon = hallIndex === 1 ? Castle : Building2;

                              return (
                                <Badge
                                  variant="outline"
                                  className={`gap-1.5 ${hallIndex === 1
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                    : 'border-cyan-200 bg-cyan-50 text-cyan-700'
                                    }`}
                                >
                                  <HallIcon className="w-3.5 h-3.5" />
                                  <span className="font-bold">{hallNumber}</span>
                                  <span>
                                    {typeof res.hall === 'string'
                                      ? (halls.find(h => h.id === res.hall || h._id === res.hall)?.name || 'Salle')
                                      : res.hall?.name || 'Salle'}
                                  </span>
                                </Badge>
                              );
                            })()}
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
                        const event = typeof res.event === 'object' ? res.event : realEvents.find(e => (e._id || e.id) === res.event);
                        const resId = res._id || res.id || "";
                        return (
                          <TableRow key={resId}>
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
                                      onClick={() => handleStatusChange('event', resId, 'confirmed')}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => handleStatusChange('event', resId, 'canceled')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteEventReservation(resId)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
                    <Label className="text-muted-foreground">Salle</Label>
                    <p className="font-medium">
                      {typeof selectedHallRes.hall === 'string'
                        ? (halls.find(h => h.id === selectedHallRes.hall || h._id === selectedHallRes.hall)?.name || 'Inconnue')
                        : (selectedHallRes.hall as Hall)?.name || 'Inconnue'}
                    </p>
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
                  const event = typeof selectedEventRes.event === 'object' ? selectedEventRes.event : realEvents.find(e => (e._id || e.id) === selectedEventRes.event);
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
                    onClick={() => handleStatusChange('event', selectedEventRes._id || selectedEventRes.id || "", 'canceled')}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('event', selectedEventRes._id || selectedEventRes.id || "", 'confirmed')}
                  >
                    Confirmer
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeleteEventReservation(selectedEventRes?._id || selectedEventRes?.id || "")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              Exporter les réservations en PDF
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Période à exporter</Label>
              <Select value={exportRange} onValueChange={(v: ExportRange) => setExportRange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Derniers 7 jours</SelectItem>
                  <SelectItem value="30days">Derniers 30 jours</SelectItem>
                  <SelectItem value="year">Dernière année</SelectItem>
                  <SelectItem value="all">Toutes les réservations</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground pt-1">
                Le rapport inclura les réservations des Terrains, de la Salle et des Événements pour la période sélectionnée.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
              Annuler
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Générer le PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
