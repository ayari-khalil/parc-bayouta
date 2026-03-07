import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ShoppingBag, BellRing, Receipt, CheckCircle2,
    Clock, XCircle, Loader2, Volume2, VolumeX,
    Check, Trash2, Download, TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as orderApi from "@/api/orderApi";
import * as notificationApi from "@/api/notificationApi";
import { toast } from "sonner";
import { auditApi } from "@/api/auditApi";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminOrders() {
    const { user } = useAuth();
    const queryClient = useQueryClient();


    // Queries
    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: orderApi.getOrders,
        refetchInterval: 10000, // Sync every 10s
    });

    const { data: notifications = [], isLoading: notifsLoading } = useQuery({
        queryKey: ['adminNotifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 10000,
    });

    const [exportDate, setExportDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: (data: { id: string, status: string }) =>
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${data.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: data.status })
            }).then(res => res.json()),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });

            const order = orders.find(o => o.id === variables.id);
            const statusLabels: Record<string, string> = {
                'pending': 'EN ATTENTE',
                'preparing': 'PRÉPARATION',
                'completed': 'TERMINÉE',
                'cancelled': 'ANNULÉE'
            };

            auditApi.recordLog({
                admin: user?.username || "Admin",
                action: "MODIFICATION",
                category: "Commandes Restaurant",
                details: `Statut de la commande Table ${order?.tableNumber} mis à jour : ${statusLabels[variables.status] || variables.status}`
            });

            toast.success("Statut mis à jour");
        }
    });

    const readNotifMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: (_, notifId) => {
            queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });

            const notif = notifications.find(n => n.id === notifId);
            auditApi.recordLog({
                admin: user?.username || "Admin",
                action: "MODIFICATION",
                category: "Appels Clients",
                details: `Appel client Table ${notif?.tableNumber} marqué comme traité`
            });
        }
    });

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">En attente</Badge>;
            case 'preparing': return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">En préparation</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Terminée</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Annulée</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const exportToExcel = () => {
        const dateStr = exportDate;
        const dayOrders = orders.filter(o => {
            const orderDate = format(new Date(o.createdAt!), 'yyyy-MM-dd');
            return orderDate === dateStr && o.status === 'completed';
        });

        if (dayOrders.length === 0) {
            toast.warning(`Aucune commande payée le ${format(new Date(dateStr + 'T00:00:00'), 'dd/MM/yyyy', { locale: fr })}`);
            return;
        }

        const totalRevenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const dateLabel = format(new Date(dateStr + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr });

        // Build rows for the sheet
        const sheetData: (string | number)[][] = [
            ['Chiffre d\'Affaires — Parc Bayouta'],
            [`Date : ${dateLabel}`],
            [],
            ['#', 'Table', 'Heure', 'Articles commandés', 'Total (DT)'],
        ];

        dayOrders.forEach((o, i) => {
            const articles = o.items.map(it => `${it.quantity}x ${it.name}`).join(' | ');
            sheetData.push([
                i + 1,
                o.tableNumber,
                format(new Date(o.createdAt!), 'HH:mm', { locale: fr }),
                articles,
                o.totalAmount,
            ]);
        });

        sheetData.push([]);
        sheetData.push(['', '', '', 'TOTAL CHIFFRE D\'AFFAIRES', totalRevenue]);
        sheetData.push([`Nombre de commandes payées : ${dayOrders.length}`]);

        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Column widths
        ws['!cols'] = [
            { wch: 5 },   // #
            { wch: 8 },   // Table
            { wch: 8 },   // Heure
            { wch: 60 },  // Articles
            { wch: 14 },  // Total
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `CA ${dateStr}`);
        XLSX.writeFile(wb, `CA_Parc_Bayouta_${dateStr}.xlsx`);

        toast.success(`Export Excel réussi — ${dayOrders.length} commande(s) — Total: ${totalRevenue} DT`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">Gestion Restaurant</h1>
                        <p className="text-muted-foreground">Suivi des commandes et appels serveurs en temps réel</p>
                    </div>
                </div>

                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="orders" className="gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Commandes
                            {orders.filter(o => o.status === 'pending').length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">
                                    {orders.filter(o => o.status === 'pending').length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calls" className="gap-2">
                            <BellRing className="w-4 h-4" />
                            Appels & Addition
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-white text-[10px]">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="mt-6">
                        {/* Daily Revenue Export Bar */}
                        <div className="mb-6 p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-sm">Export chiffre d'affaires</span>
                            </div>
                            <div className="flex flex-1 items-center gap-3 flex-wrap">
                                <Input
                                    type="date"
                                    value={exportDate}
                                    onChange={e => setExportDate(e.target.value)}
                                    className="w-44"
                                />
                                {/* Daily revenue preview */}
                                {(() => {
                                    const dayTotal = orders
                                        .filter(o => format(new Date(o.createdAt!), 'yyyy-MM-dd') === exportDate && o.status === 'completed')
                                        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                                    const dayCount = orders.filter(o => format(new Date(o.createdAt!), 'yyyy-MM-dd') === exportDate && o.status === 'completed').length;
                                    return dayCount > 0 ? (
                                        <span className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                                            {dayCount} commande{dayCount > 1 ? 's' : ''} &nbsp;·&nbsp; {dayTotal} DT
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Aucune commande payée ce jour</span>
                                    );
                                })()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 shrink-0"
                                onClick={exportToExcel}
                            >
                                <Download className="w-4 h-4" />
                                Exporter Excel
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ordersLoading ? (
                                <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                                            <span className="font-bold text-lg">Table {order.tableNumber}</span>
                                            {renderStatusBadge(order.status)}
                                        </div>
                                        <div className="p-4 flex-grow space-y-3">
                                            <ul className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm">
                                                        <span><span className="font-bold text-accent mr-2">{item.quantity}x</span> {item.name}</span>
                                                        <span className="text-muted-foreground">{item.price * item.quantity} DT</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-3 border-t border-dashed flex justify-between font-bold">
                                                <span>TOTAL</span>
                                                <span className="text-accent">{order.totalAmount} DT</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground text-right pt-2 italic">
                                                {format(new Date(order.createdAt!), "HH:mm", { locale: fr })}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-muted/10 border-t border-border mt-auto grid grid-cols-2 gap-2">
                                            {order.status === 'pending' && (
                                                <Button
                                                    className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: order.id!, status: 'preparing' })}
                                                >
                                                    <Clock className="w-4 h-4" /> Préparer
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button
                                                    className="col-span-2 bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: order.id!, status: 'completed' })}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Servie / Payée
                                                </Button>
                                            )}
                                            {order.status !== 'cancelled' && order.status !== 'completed' && (
                                                <Button
                                                    variant="outline"
                                                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: order.id!, status: 'cancelled' })}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Annuler
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-muted-foreground">Aucune commande aujourd'hui</div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="calls" className="mt-6">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {notifsLoading ? (
                                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${notif.isRead ? 'bg-muted/20 border-border opacity-60' : 'bg-card border-accent shadow-md ring-1 ring-accent/20'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notif.type === 'waiter_call' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {notif.type === 'waiter_call' ? <BellRing /> : <Receipt />}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">Table {notif.tableNumber}</h3>
                                                {notif.type === 'bill_request' && <Badge className="bg-orange-500">Addition</Badge>}
                                                {notif.type === 'waiter_call' && <Badge className="bg-blue-500">Serveur</Badge>}
                                            </div>
                                            <p className="text-muted-foreground text-sm">{notif.message}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {format(new Date(notif.createdAt), "HH:mm:ss", { locale: fr })}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <Button
                                                className="rounded-full h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => readNotifMutation.mutate(notif.id)}
                                            >
                                                <Check className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {notif.isRead && (
                                            <div className="text-green-600 font-medium text-sm flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Traité
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-muted-foreground">Tout est calme pour le moment</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
