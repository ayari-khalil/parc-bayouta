import { useState, useEffect } from "react";
import { Search, Mail, Phone, Eye, Archive, Check, Trash2, Download, MessageSquare, Loader2 } from "lucide-react";
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
import {
  getStatusColor,
  getStatusLabel
} from "@/data/mockData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
<<<<<<< HEAD
import { getMessages, updateMessageStatus, deleteMessage, ContactMessage } from "@/api/contactApi";
=======
import { auditApi } from "@/api/auditApi";
import { useAuth } from "@/contexts/AuthContext";
>>>>>>> 2441a2b46f75f4c431763d2868b34eac10db9dc8

export default function AdminMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (messageId: string, newStatus: 'processed' | 'archived') => {
<<<<<<< HEAD
    try {
      await updateMessageStatus(messageId, newStatus);
      toast({
        title: newStatus === 'processed' ? "Message traité" : "Message archivé",
        description: `Le message a été marqué comme ${newStatus === 'processed' ? 'traité' : 'archivé'}.`,
      });
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return;
    try {
      await deleteMessage(deleteMessageId);
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès.",
      });
      fetchMessages();
      setDeleteMessageId(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message.",
        variant: "destructive",
      });
    }
=======
    const msg = contactMessages.find(m => m.id === messageId);

    await auditApi.recordLog({
      admin: user?.username || "Admin",
      action: "MODIFICATION",
      category: "Messages & Demandes",
      details: `Message de ${msg?.name} marqué comme ${newStatus === 'processed' ? 'traité' : 'archivé'}`
    });

    toast({
      title: newStatus === 'processed' ? "Message traité" : "Message archivé",
      description: `Le message a été marqué comme ${newStatus === 'processed' ? 'traité' : 'archivé'}.`,
    });
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (deleteMessageId) {
      const msg = contactMessages.find(m => m.id === deleteMessageId);
      await auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Messages & Demandes",
        details: `Suppression du message de ${msg?.name} (Sujet: ${msg?.subject})`
      });
    }

    toast({
      title: "Message supprimé",
      description: "Le message a été supprimé avec succès.",
    });
    setDeleteMessageId(null);
>>>>>>> 2441a2b46f75f4c431763d2868b34eac10db9dc8
  };

  const handleExportCSV = () => {
    toast({
      title: "Export en cours",
      description: "Le fichier CSV sera téléchargé dans quelques instants.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Messages & Demandes</h1>
            <p className="text-muted-foreground">Gérez les messages de contact et demandes d'événements</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nouveaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {messages.filter(m => m.status === 'new').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Traités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'processed').length}
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
                    placeholder="Rechercher par nom, sujet ou contenu..."
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
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="processed">Traité</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Chargement des messages...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun message trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow key={message.id} className={message.status === 'new' ? 'bg-blue-50/50' : ''}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(message.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[150px]">
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {message.phone}
                            </div>
                            {message.email && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {message.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium italic min-w-[120px]">{message.subject}</TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {message.message}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(message.status)}>
                            {getStatusLabel(message.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {message.status === 'new' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusChange(message.id, 'processed')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            {message.status !== 'archived' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(message.id, 'archived')}
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteMessageId(message.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Message Details Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
              <DialogDescription>
                Reçu le {selectedMessage && format(new Date(selectedMessage.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nom</Label>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedMessage.phone}</p>
                  </div>
                  {selectedMessage.email && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge className={getStatusColor(selectedMessage.status)}>
                      {getStatusLabel(selectedMessage.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.open(`tel:${selectedMessage?.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              {selectedMessage?.email && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(`mailto:${selectedMessage.email}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer un email
                </Button>
              )}
              {selectedMessage?.status === 'new' && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => handleStatusChange(selectedMessage.id, 'processed')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Marquer comme traité
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteMessageId(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteMessage}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
