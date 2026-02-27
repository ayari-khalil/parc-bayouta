import { useState, useEffect, useRef } from "react";
import { Calendar, Search, Plus, Eye, Check, X, Ban, Users, PartyPopper, Trash2, Building2, Castle } from "lucide-react";
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
  getStatusColor,
  getStatusLabel
} from "@/data/mockData";
import { reservationApi, HallReservation, Hall } from "@/lib/api/reservation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import { auditApi } from "@/api/auditApi";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminEventHall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [realHallReservations, setRealHallReservations] = useState<HallReservation[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<HallReservation | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockHall, setBlockHall] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const lastResCount = useRef(0);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");

    fetchHalls();
    fetchHallReservations();
    const interval = setInterval(fetchHallReservations, 5000);
    return () => clearInterval(interval);
  }, [selectedHall]);

  const fetchHalls = async () => {
    try {
      const data = await reservationApi.getHalls();
      setHalls(data);
      if (data.length > 0 && !blockHall) {
        setBlockHall(data[0].id || data[0]._id!);
      }
    } catch (error) {
      console.error("Failed to fetch halls:", error);
    }
  };

  const fetchHallReservations = async () => {
    try {
      const hallId = selectedHall === "all" ? undefined : selectedHall;
      const data = await reservationApi.getAllHallReservations(hallId);

      if (data.length > lastResCount.current && lastResCount.current > 0) {
        notificationSound.current?.play().catch(e => console.log("Sound play failed:", e));
        toast({
          title: "Nouvelle réservation !",
          description: "Une nouvelle demande de réservation pour la salle a été reçue.",
        });
      }

      setRealHallReservations(data);
      lastResCount.current = data.length;
    } catch (error) {
      console.error("Failed to fetch hall reservations:", error);
    }
  };

  // Filter reservations
  const filteredReservations = realHallReservations.filter(res => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery) ||
      res.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar data
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'blocked':
        return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getAllReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return realHallReservations.filter(res => {
      const resDate = format(new Date(res.date), 'yyyy-MM-dd');
      return resDate === dateStr && res.status !== 'canceled';
    });
  };

  const handleStatusChange = async (reservationId: string, newStatus: 'confirmed' | 'canceled') => {
    try {
      const res = realHallReservations.find(r => (r.id || (r as any)._id) === reservationId);
      await reservationApi.updateHallReservationStatus(reservationId, newStatus);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: newStatus === 'confirmed' ? "CONFIRMATION" : "ANNULATION",
        category: "Réservations Salle",
        details: `${newStatus === 'confirmed' ? "Confirmation" : "Annulation"} de la réservation salle pour ${res?.customerName}`
      });

      fetchHallReservations();
      toast({
        title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
        description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès.`,
      });
      setSelectedReservation(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation définitivement ? Cette action libérera la date.")) return;

    try {
      const res = realHallReservations.find(r => (r.id || (r as any)._id) === reservationId);
      await reservationApi.deleteHallReservation(reservationId);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Réservations Salle",
        details: `Suppression de la réservation salle pour ${res?.customerName}`
      });

      fetchHallReservations();
      toast({
        title: "Réservation supprimée",
        description: "La réservation a été supprimée avec succès.",
      });
      setSelectedReservation(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réservation.",
        variant: "destructive",
      });
    }
  };

  const handleBlockDate = async () => {
    if (!blockDate) return;

    try {
      await reservationApi.createHallReservation({
        hall: blockHall,
        date: new Date(blockDate).toISOString(),
        customerName: "BLOCAGE_ADMIN",
        customerPhone: "0000",
        eventType: "Maintenance",
        guestCount: 0,
        message: blockReason,
        status: 'blocked'
      });

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "BLOCAGE",
        category: "Réservations Salle",
        details: `Blocage de la date ${format(new Date(blockDate), 'dd MMMM yyyy', { locale: fr })} (Raison: ${blockReason || 'Non spécifiée'})`
      });

      fetchHallReservations();
      toast({
        title: "Date bloquée",
        description: `La date du ${format(new Date(blockDate), 'dd MMMM yyyy', { locale: fr })} a été bloquée.`,
      });
      setShowBlockDialog(false);
      setBlockDate("");
      setBlockReason("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de bloquer la date.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Salle des Fêtes</h1>
            <p className="text-muted-foreground">Gérez les réservations de la salle des fêtes</p>
          </div>
          <Button onClick={() => setShowBlockDialog(true)}>
            <Ban className="w-4 h-4 mr-2" />
            Bloquer une date
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Réservations ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realHallReservations.filter(r => {
                  const resDate = new Date(r.date);
                  return isSameMonth(resDate, selectedMonth);
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {realHallReservations.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realHallReservations.filter(r => r.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Invités totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realHallReservations.filter(r => r.status === 'confirmed').reduce((acc, r) => acc + r.guestCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
              >
                Mois précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(new Date())}
              >
                Ce mois
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              >
                Mois suivant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[600px]">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center font-medium text-sm p-2 text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`padding-${i}`} className="aspect-square" />
                ))}
                {calendarDays.map(day => {
                  const reservations = getAllReservationsForDate(day);
                  const isTodayRes = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] p-2 border border-border rounded-lg cursor-pointer transition-all hover:shadow-md ${isTodayRes ? 'ring-2 ring-primary bg-primary/5' : ''
                        } ${reservations.length > 0 ? 'hover:bg-muted/50' : 'hover:bg-muted/30'}`}
                      onClick={() => reservations.length > 0 && setSelectedReservation(reservations[0])}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isTodayRes ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                          {format(day, 'd')}
                        </span>
                        {reservations.length > 1 && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-background">
                            +{reservations.length - 1}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {reservations.map((res, idx) => {
                          const hallId = typeof res.hall === 'string' ? res.hall : res.hall?.id || (res.hall as any)?._id;
                          const hallIndex = halls.findIndex(h => (h.id === hallId || h._id === hallId));
                          const hallNumber = hallIndex !== -1 ? hallIndex + 1 : idx + 1;

                          const colors = getStatusColors(res.status);
                          const isBlocked = res.status === 'blocked';
                          const Icon = isBlocked ? Ban : (hallIndex === 0 ? Building2 : Castle);

                          return (
                            <div
                              key={res.id || idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReservation(res);
                              }}
                              className={`text-[10px] p-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border} flex items-center gap-1 truncate shadow-sm hover:scale-105 transition-transform ${isBlocked ? 'font-bold' : ''}`}
                              title={`${typeof res.hall === 'object' ? res.hall.name : 'Salle'}: ${isBlocked ? 'BLOQUÉ' : res.eventType}`}
                            >
                              <div className="flex items-center gap-0.5 shrink-0">
                                <span className="font-bold text-[9px]">{hallNumber}</span>
                                <Icon className="w-2.5 h-2.5" />
                              </div>
                              <span className="truncate">{isBlocked ? 'BLOQUÉ' : res.eventType}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, téléphone ou type d'événement..."
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
              <Select value={selectedHall} onValueChange={setSelectedHall}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les salles</SelectItem>
                  {halls.map((hall) => (
                    <SelectItem key={hall.id || hall._id} value={hall.id || hall._id!}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        {format(new Date(reservation.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeof reservation.hall === 'string'
                            ? (halls.find(h => h.id === reservation.hall || h._id === reservation.hall)?.name || 'Inconnue')
                            : reservation.hall?.name || 'Inconnue'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.customerName}</div>
                          <div className="text-sm text-muted-foreground">{reservation.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PartyPopper className="w-4 h-4 text-muted-foreground" />
                          {reservation.eventType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {reservation.guestCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleStatusChange(reservation.id, 'canceled')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteReservation(reservation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReservations.length === 0 && (
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

        {/* Reservation Details Dialog */}
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedReservation.status !== 'blocked' && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Client</Label>
                        <p className="font-medium">{selectedReservation.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Téléphone</Label>
                        <p className="font-medium">{selectedReservation.customerPhone}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedReservation.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Salle</Label>
                    <p className="font-medium">
                      {typeof selectedReservation.hall === 'string'
                        ? (halls.find(h => h.id === selectedReservation.hall || h._id === selectedReservation.hall)?.name || 'Inconnue')
                        : (selectedReservation.hall as Hall)?.name || 'Inconnue'}
                    </p>
                  </div>
                  {selectedReservation.status !== 'blocked' && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Type d'événement</Label>
                        <p className="font-medium">{selectedReservation.eventType}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Nombre d'invités</Label>
                        <p className="font-medium">{selectedReservation.guestCount} personnes</p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {getStatusLabel(selectedReservation.status)}
                    </Badge>
                  </div>
                </div>
                {selectedReservation.message && (
                  <div>
                    <Label className="text-muted-foreground">Message</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedReservation.message}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Créé le</Label>
                  <p className="font-medium">
                    {format(new Date(selectedReservation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedReservation?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedReservation.id, 'canceled')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedReservation.id, 'confirmed')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeleteReservation(selectedReservation.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Date Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquer une date</DialogTitle>
              <DialogDescription>
                Bloquez une date pour rendre la salle indisponible
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Salle</Label>
                <Select value={blockHall} onValueChange={setBlockHall}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id || hall._id} value={hall.id || hall._id!}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Raison (optionnel)</Label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Maintenance, Événement privé..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleBlockDate}>
                Bloquer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
