import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Search, Coffee, UtensilsCrossed, IceCream, Cake, Wine } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { menuCategories, menuItems, MenuCategory, MenuItem } from "@/data/mockData";

const iconMap: Record<string, any> = {
  Coffee, UtensilsCrossed, IceCream, Cake, Wine
};

export default function AdminMenu() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Category dialog
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "Coffee" });

  // Item dialog
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    isActive: true
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'category' | 'item', id: string } | null>(null);

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Category handlers
  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, icon: category.icon });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", icon: "Coffee" });
    }
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    toast({
      title: editingCategory ? "Catégorie modifiée" : "Catégorie créée",
      description: `La catégorie "${categoryForm.name}" a été ${editingCategory ? 'modifiée' : 'créée'} avec succès.`,
    });
    setShowCategoryDialog(false);
    setCategoryForm({ name: "", icon: "Coffee" });
    setEditingCategory(null);
  };

  // Item handlers
  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        price: item.price.toString(),
        description: item.description || "",
        categoryId: item.categoryId,
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: "", price: "", description: "", categoryId: "", isActive: true });
    }
    setShowItemDialog(true);
  };

  const handleSaveItem = () => {
    toast({
      title: editingItem ? "Article modifié" : "Article créé",
      description: `L'article "${itemForm.name}" a été ${editingItem ? 'modifié' : 'créé'} avec succès.`,
    });
    setShowItemDialog(false);
    setItemForm({ name: "", price: "", description: "", categoryId: "", isActive: true });
    setEditingItem(null);
  };

  const handleToggleItemActive = (item: MenuItem) => {
    toast({
      title: item.isActive ? "Article désactivé" : "Article activé",
      description: `L'article "${item.name}" a été ${item.isActive ? 'désactivé' : 'activé'}.`,
    });
  };

  const handleDelete = () => {
    if (deleteDialog) {
      toast({
        title: deleteDialog.type === 'category' ? "Catégorie supprimée" : "Article supprimé",
        description: `La suppression a été effectuée avec succès.`,
      });
      setDeleteDialog(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Gestion du Menu</h1>
            <p className="text-muted-foreground">Gérez les catégories et articles du café-restaurant</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuCategories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Articles actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {menuItems.filter(i => i.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Articles désactivés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {menuItems.filter(i => !i.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex justify-start overflow-x-auto h-auto p-1 bg-muted/50">
            <TabsTrigger value="items" className="flex-1 sm:flex-none">Articles</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 sm:flex-none">Catégories</TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Articles du Menu</CardTitle>
                <Button onClick={() => openItemDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel article
                </Button>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un article..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {menuCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const category = menuCategories.find(c => c.id === item.categoryId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {item.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{category?.name}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.price} DA</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={item.isActive}
                                  onCheckedChange={() => handleToggleItemActive(item)}
                                />
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                  {item.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openItemDialog(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteDialog({ type: 'item', id: item.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Aucun article trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Catégories</CardTitle>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle catégorie
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ordre</TableHead>
                        <TableHead>Icône</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Articles</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuCategories.sort((a, b) => a.order - b.order).map((category) => {
                        const IconComponent = iconMap[category.icon] || Coffee;
                        const itemCount = menuItems.filter(i => i.categoryId === category.id).length;

                        return (
                          <TableRow key={category.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                <span>{category.order}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{itemCount} articles</TableCell>
                            <TableCell>
                              <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openCategoryDialog(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeleteDialog({ type: 'category', id: category.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la catégorie</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Boissons Chaudes"
                />
              </div>
              <div className="space-y-2">
                <Label>Icône</Label>
                <Select
                  value={categoryForm.icon}
                  onValueChange={(v) => setCategoryForm({ ...categoryForm, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconMap).map(iconName => {
                      const Icon = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {iconName}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCategory}>
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Item Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'article</Label>
                <Input
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Ex: Café Express"
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(v) => setItemForm({ ...itemForm, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prix (DA)</Label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Description de l'article..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.isActive}
                  onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                />
                <Label>Article actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowItemDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveItem}>
                {editingItem ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer {deleteDialog?.type === 'category' ? 'cette catégorie' : 'cet article'} ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
