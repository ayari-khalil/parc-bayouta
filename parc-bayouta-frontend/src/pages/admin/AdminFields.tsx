import { useState } from "react";
import { Calendar, Search, Filter, Plus, Edit, Trash2, Eye, Ban, Check, X, Clock, Repeat, Edit2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { reservationApi, FieldReservation } from "@/lib/api/reservation";
import { useEffect } from "react";
import { auditApi } from "@/api/auditApi";
import { useAuth } from "@/contexts/AuthContext";

const initialFields = [
  { id: 1, name: "Terrain 1", status: 'active', dbId: "", image: null as string | null },
  { id: 2, name: "Terrain 2", status: 'active', dbId: "", image: null as string | null },
];

const timeSlots = [
  // { id: "1", time: "06:00" }, { id: "2", time: "07:15" }, { id: "3", time: "08:30" },
  { id: "4", time: "09:45" }, { id: "5", time: "11:00" }, { id: "6", time: "12:15" },
  { id: "7", time: "13:30" }, { id: "8", time: "14:45" }, { id: "9", time: "16:00" },
  { id: "10", time: "17:15" }, { id: "11", time: "18:30" }, { id: "12", time: "19:45" },
  { id: "13", time: "21:00" }, { id: "14", time: "22:15" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return "bg-green-100 text-green-800";
    case 'canceled': return "bg-red-100 text-red-800";
    case 'pending': return "bg-yellow-100 text-yellow-800";
    case 'blocked': return "bg-gray-100 text-gray-800";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return "Confirmé";
    case 'canceled': return "Annulé";
    case 'pending': return "En attente";
    case 'blocked': return "Bloqué";
    default: return status;
  }
};

export default function AdminFields() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedReservation, setSelectedReservation] = useState<FieldReservation | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockData, setBlockData] = useState({ fieldId: "1", date: "", timeSlot: "", reason: "" });
  const [allReservations, setAllReservations] = useState<FieldReservation[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addData, setAddData] = useState({
    fieldId: 1,
    date: "",
    timeSlot: "",
    customerName: "",
    customerPhone: "",
    isRecurring: false
  });
  const [fields, setFields] = useState(initialFields);
  const [isLoading, setIsLoading] = useState(true);
  const [showFieldsDialog, setShowFieldsDialog] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [reservationsData, fieldsData] = await Promise.all([
        reservationApi.getAllFieldReservations(),
        reservationApi.getFields()
      ]);
      setAllReservations(reservationsData);

      if (fieldsData.length > 0) {
        setFields(prev => prev.map(f => {
          const dbField = fieldsData.find(df => df.name === f.name);
          return dbField ? { ...f, dbId: dbField.id || (dbField as any)._id } : f;
        }));
      }
    } catch (error) {
      console.error("Failed to fetch field data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();

      const field = fields.find(f => f.dbId === fieldId);
      const currentImages = (field as any)?.images || [];

      await reservationApi.updateField(fieldId, { images: [...currentImages, data.url] });

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Terrains",
        details: `Ajout d'une image pour le terrain ${field?.name}`
      });

      toast({
        title: "Image ajoutée",
        description: "L'image a été ajoutée à la galerie avec succès.",
      });
      fetchInitialData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (fieldId: string, imageUrl: string) => {
    try {
      setIsUploading(true);
      const field = fields.find(f => f.dbId === fieldId);
      const currentImages = (field as any)?.images || [];
      const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

      await reservationApi.updateField(fieldId, { images: updatedImages });

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Terrains",
        details: `Suppression d'une image pour le terrain ${field?.name}`
      });

      toast({
        title: "Image supprimée",
        description: "L'image a été retirée de la galerie.",
      });
      fetchInitialData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateFieldName = async (fieldId: string, newName: string) => {
    try {
      setIsSaving(true);
      await reservationApi.updateField(fieldId, { name: newName });

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Terrains",
        details: `Mise à jour du nom du terrain: ${newName}`
      });

      toast({
        title: "Terrain mis à jour",
        description: "Le nom du terrain a été modifié avec succès.",
      });
      fetchInitialData();
      setEditingField(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le terrain.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const data = await reservationApi.getAllFieldReservations();
      setAllReservations(data);
    } catch (error) {
      console.error("Failed to fetch field reservations:", error);
    }
  };

  // Get week dates for calendar view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter reservations
  const filteredReservations = allReservations.filter(res => {
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;

    const resFieldId = typeof res.field === 'object'
      ? (res.field as any).id || (res.field as any)._id
      : res.field;
    const targetField = fields.find(f => f.id.toString() === fieldFilter);
    let matchesField = fieldFilter === "all" || resFieldId === targetField?.dbId || resFieldId === targetField?.id.toString();
    if (!matchesField && fieldFilter !== "all" && typeof res.field === 'object' && targetField) {
      matchesField = res.field.name === targetField.name;
    }

    return matchesSearch && matchesStatus && matchesField;
  });

  const handleStatusChange = async (reservationId: string, newStatus: 'confirmed' | 'canceled') => {
    try {
      const res = allReservations.find(r => (r.id || (r as any)._id) === reservationId);
      await reservationApi.updateFieldReservationStatus(reservationId, newStatus);

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: newStatus === 'confirmed' ? "CONFIRMATION" : "ANNULATION",
        category: "Réservations Terrains",
        details: `${newStatus === 'confirmed' ? "Confirmation" : "Annulation"} de la réservation terrain pour ${res?.customerName}`
      });

      toast({
        title: newStatus === 'confirmed' ? "Réservation confirmée" : "Réservation annulée",
        description: `La réservation a été ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès.`,
      });
      fetchReservations();
      setSelectedReservation(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    }
  };

  const handleBlockSlot = async () => {
    try {
      // Assuming block info should be logged even if it's currently a mock toast
      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "BLOCAGE",
        category: "Réservations Terrains",
        details: `Blocage du créneau ${blockData.timeSlot} le ${blockData.date} pour le Terrain ${blockData.fieldId} (Raison: ${blockData.reason || 'Non spécifiée'})`
      });

      toast({
        title: "Créneau bloqué",
        description: "Le créneau a été bloqué avec succès.",
      });
      setShowBlockDialog(false);
      setBlockData({ fieldId: "1", date: "", timeSlot: "", reason: "" });
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleCreateReservation = async () => {
    try {
      const fieldIdNum = Number(addData.fieldId);
      const selectedFieldObj = fields.find(f => f.id === fieldIdNum);
      const targetDbId = selectedFieldObj?.dbId;

      if (!targetDbId) {
        toast({
          title: "Erreur",
          description: "Impossible de trouver l'ID du terrain.",
          variant: "destructive",
        });
        return;
      }

      await reservationApi.createFieldReservation({
        field: targetDbId,
        date: addData.date,
        timeSlot: addData.timeSlot,
        customerName: addData.customerName,
        customerPhone: addData.customerPhone,
        isRecurring: addData.isRecurring,
      });

      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "CRÉATION",
        category: "Réservations Terrains",
        details: `Création manuelle d'une réservation pour ${addData.customerName} (Terrain: ${selectedFieldObj?.name}, Date: ${addData.date}, Créneau: ${addData.timeSlot})`
      });

      toast({
        title: "Réservation créée",
        description: "La réservation a été ajoutée avec succès.",
      });
      setShowAddDialog(false);
      setAddData({
        fieldId: 1,
        date: "",
        timeSlot: "",
        customerName: "",
        customerPhone: "",
        isRecurring: false
      });
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = (fieldId: number, date: Date, timeSlot: string) => {
    setAddData({
      fieldId,
      date: format(date, 'yyyy-MM-dd'),
      timeSlot,
      customerName: "",
      customerPhone: "",
      isRecurring: false
    });
    setShowAddDialog(true);
  };

  const getReservationForSlot = (fieldId: number, date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const targetField = fields.find(f => f.id === fieldId);
    return allReservations.find(res => {
      const resDate = format(new Date(res.date), 'yyyy-MM-dd');
      const resFieldId = typeof res.field === 'object'
        ? (res.field as any).id || (res.field as any)._id
        : res.field;

      let fieldMatch = resFieldId === targetField?.dbId || resFieldId === targetField?.id.toString();
      if (!fieldMatch && typeof res.field === 'object' && targetField) {
        fieldMatch = res.field.name === targetField.name;
      }

      return fieldMatch && resDate === dateStr && res.timeSlot === time;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Gestion des Terrains</h1>
            <p className="text-muted-foreground">Gérez les réservations et la disponibilité des terrains</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Liste
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Calendrier
            </Button>
            <Button variant="outline" onClick={() => setShowFieldsDialog(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Gérer les Terrains
            </Button>
            <Button onClick={() => setShowBlockDialog(true)}>
              <Ban className="w-4 h-4 mr-2" />
              Bloquer un créneau
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Réservations aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allReservations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}
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
                {allReservations.filter(r => r.status === 'pending').length}
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
                {allReservations.filter(r => r.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Terrains actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fields.filter(f => f.status === 'active').length} / {fields.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {viewMode === "list" ? (
          <>
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
                    </SelectContent>
                  </Select>
                  <Select value={fieldFilter} onValueChange={setFieldFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Terrain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les terrains</SelectItem>
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reservations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Créneau</TableHead>
                        <TableHead>Terrain</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Téléphone</TableHead>
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
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {reservation.timeSlot}
                            </div>
                          </TableCell>
                          <TableCell>
                            {typeof reservation.field === 'object' ? reservation.field.name : `Terrain ${reservation.field}`}
                          </TableCell>
                          <TableCell className="font-medium">{reservation.customerName}</TableCell>
                          <TableCell>{reservation.customerPhone}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusLabel(reservation.status)}
                            </Badge>
                            {reservation.isRecurring && (
                              <Repeat className="w-3 h-3 ml-1 text-primary inline" />
                            )}
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
                                    onClick={() => handleStatusChange(reservation.id || reservation._id || "", 'confirmed')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleStatusChange(reservation.id || reservation._id || "", 'canceled')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredReservations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucune réservation trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Calendar View */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vue Calendrier</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  Semaine précédente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Aujourd'hui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  Semaine suivante
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-border bg-muted text-left text-sm font-medium">
                        Créneau
                      </th>
                      {weekDates.map(date => (
                        <th key={date.toISOString()} className="p-2 border border-border bg-muted text-center text-sm font-medium min-w-[120px]">
                          <div>{format(date, 'EEE', { locale: fr })}</div>
                          <div className="text-xs text-muted-foreground">{format(date, 'dd/MM')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => (
                      <tr key={slot.id}>
                        <td className="p-2 border border-border bg-muted/50 text-sm font-medium">
                          {slot.time}
                        </td>
                        {weekDates.map(date => {
                          const res1 = getReservationForSlot(1, date, slot.time);
                          const res2 = getReservationForSlot(2, date, slot.time);
                          return (
                            <td key={date.toISOString()} className="p-1 border border-border">
                              <div className="space-y-1">
                                {[1, 2].map(fieldId => {
                                  const res = fieldId === 1 ? res1 : res2;
                                  return (
                                    <div
                                      key={fieldId}
                                      className={`p-1 rounded text-xs cursor-pointer transition-colors ${res
                                        ? res.status === 'confirmed'
                                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                          : res.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                            : 'bg-red-100 text-red-800'
                                        : 'bg-muted/30 hover:bg-muted text-muted-foreground border border-dashed border-muted-foreground/30'
                                        }`}
                                      onClick={() => res ? setSelectedReservation(res) : openAddDialog(fieldId, date, slot.time)}
                                    >
                                      <div className="font-medium flex items-center gap-1">
                                        T{fieldId}
                                        {res && res.isRecurring && <Repeat className="w-3 h-3 text-primary" />}
                                        {!res && <Plus className="w-2 h-2 ml-auto opacity-50" />}
                                      </div>
                                      {res ? (
                                        <div className="truncate">{res.customerName}</div>
                                      ) : (
                                        <div className="text-[10px] opacity-40">Libre</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservation Details Dialog */}
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client</Label>
                    <p className="font-medium">{selectedReservation.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedReservation.customerPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">
                      {format(new Date(selectedReservation.date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Créneau</Label>
                    <p className="font-medium">{selectedReservation.timeSlot}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Terrain</Label>
                    <p className="font-medium">
                      {typeof selectedReservation.field === 'object' ? selectedReservation.field.name : `Terrain ${selectedReservation.field}`}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {getStatusLabel(selectedReservation.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Créé le</Label>
                  <p className="font-medium">
                    {selectedReservation.createdAt && format(new Date(selectedReservation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedReservation?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedReservation.id || selectedReservation._id || "", 'canceled')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedReservation.id || selectedReservation._id || "", 'confirmed')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Reservation Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Réservation</DialogTitle>
              <DialogDescription>
                Ajouter une réservation manuellement pour un client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Terrain</Label>
                  <Input value={`Terrain ${addData.fieldId}`} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Créneau</Label>
                  <Input value={addData.timeSlot} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={addData.date} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nom du Client</Label>
                <Input
                  placeholder="Ex: Ahmed Ben Salem"
                  value={addData.customerName}
                  onChange={(e) => setAddData({ ...addData, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Numéro de Téléphone</Label>
                <Input
                  placeholder="Ex: 0555 123 456"
                  value={addData.customerPhone}
                  onChange={(e) => setAddData({ ...addData, customerPhone: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="admin-recurring"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  checked={addData.isRecurring}
                  onChange={(e) => setAddData({ ...addData, isRecurring: e.target.checked })}
                />
                <label htmlFor="admin-recurring" className="text-sm font-medium text-foreground cursor-pointer">
                  Réservation hebdomadaire (pendant 4 semaines)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateReservation}
                disabled={!addData.customerName || !addData.customerPhone}
              >
                Réserver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Slot Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquer un créneau</DialogTitle>
              <DialogDescription>
                Bloquez un créneau pour maintenance ou usage privé
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Terrain</Label>
                <Select value={blockData.fieldId} onValueChange={(v) => setBlockData({ ...blockData, fieldId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map(field => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={blockData.date}
                  onChange={(e) => setBlockData({ ...blockData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Créneau</Label>
                <Select value={blockData.timeSlot} onValueChange={(v) => setBlockData({ ...blockData, timeSlot: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.id} value={slot.time}>
                        {slot.time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Raison (optionnel)</Label>
                <Input
                  value={blockData.reason}
                  onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                  placeholder="Ex: Maintenance du terrain"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleBlockSlot}>
                Bloquer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Fields Dialog */}
        <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>Gestion des Terrains</DialogTitle>
                <DialogDescription>
                  Modifiez les noms et les images des terrains de football
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 space-y-6 py-4 px-6 overflow-y-auto">
              {fields.map((field, idx) => {
                const isEditing = editingField?.id === field.id;

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row gap-6 p-4 border rounded-2xl bg-muted/30">
                    <div className="flex flex-col gap-4 w-full sm:w-64">
                      <div className="grid grid-cols-2 gap-2">
                        {(field as any).images && (field as any).images.length > 0 ? (
                          (field as any).images.map((img: string, i: number) => (
                            <div key={i} className="relative aspect-square bg-muted rounded-lg overflow-hidden group/img">
                              <img
                                src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`}
                                alt={`${field.name} - ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleDeleteImage(field.dbId, img)}
                                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 aspect-video bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] text-muted-foreground">Aucune image</span>
                          </div>
                        )}
                        <label className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 cursor-pointer transition-colors group/add">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, field.dbId)}
                            disabled={isUploading}
                          />
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Plus className="w-4 h-4 text-muted-foreground group-hover/add:text-primary" />}
                        </label>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                          <Plus className="w-5 h-5 font-bold" />
                        </div>
                        <span className="font-bold text-lg">{field.name}</span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            defaultValue={field.name}
                            className="h-9"
                            id={`field-name-${field.id}`}
                          />
                          <Button
                            size="sm"
                            className="h-9"
                            disabled={isSaving}
                            onClick={() => {
                              const input = document.getElementById(`field-name-${field.id}`) as HTMLInputElement;
                              handleUpdateFieldName(field.dbId, input.value);
                            }}
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9"
                            onClick={() => setEditingField(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{field.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => setEditingField(field)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier le nom
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2">
                        <Badge variant="outline" className={field.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          {field.status === 'active' ? 'Opérationnel' : 'Indisponible'}
                        </Badge>
                        {field.dbId && (
                          <span className="text-xs text-muted-foreground italic">
                            ID: {field.dbId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 pt-2 border-t mt-auto">
              <DialogFooter>
                <Button className="w-full sm:w-auto" onClick={() => setShowFieldsDialog(false)}>Fermer</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout >
  );
}
