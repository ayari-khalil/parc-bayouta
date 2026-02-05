import { useState, useEffect } from "react";
import { Check, X, Search, Calendar, Users, Filter, Loader2, Trash2 } from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { eventApi, EventReservation, Event } from "@/api/dashboardApi";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminEventReservations() {
    const { toast } = useToast();
    const [reservations, setReservations] = useState<EventReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const data = await eventApi.getReservations();
            setReservations(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les réservations.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await eventApi.updateReservationStatus(id, status);
            toast({
                title: "Statut mis à jour",
                description: `La réservation est maintenant ${status}.`,
            });
            fetchReservations();
        } catch (error) {
            toast({ title: "Erreur", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette réservation ?")) return;
        try {
            await eventApi.deleteReservation(id);
            toast({ title: "Réservation supprimée" });
            fetchReservations();
        } catch (error) {
            toast({ title: "Erreur", variant: "destructive" });
        }
    };

    const filteredReservations = reservations.filter(res => {
        const event = res.event as Event;
        const matchesSearch =
            res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event && event.title.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || res.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                <div>
                    <h1 className="text-2xl font-display font-bold">Réservations d'Événements</h1>
                    <p className="text-muted-foreground">Gérez les inscriptions aux événements</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par client ou événement..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="confirmed">Confirmé</SelectItem>
                                    <SelectItem value="canceled">Annulé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Événement</TableHead>
                                    <TableHead>Participants</TableHead>
                                    <TableHead>Date Résa</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReservations.map((res) => (
                                    <TableRow key={res._id || res.id}>
                                        <TableCell>
                                            <div className="font-medium">{res.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{res.customerPhone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{(res.event as Event)?.title || "Événement inconnu"}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {event && (res.event as Event).date && format(new Date((res.event as Event).date), 'dd MMM yyyy', { locale: fr })}
                                            </div>
                                        </TableCell>
                                        <TableCell>{res.attendees}</TableCell>
                                        <TableCell>
                                            {format(new Date(res.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={res.status === 'confirmed' ? 'default' : res.status === 'pending' ? 'secondary' : 'destructive'}>
                                                {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : 'Annulé'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {res.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => handleUpdateStatus(res._id || res.id, 'confirmed')}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" /> Confirmer
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => handleUpdateStatus(res._id || res.id, 'canceled')}
                                                        >
                                                            <X className="w-4 h-4 mr-1" /> Annuler
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(res._id || res.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
