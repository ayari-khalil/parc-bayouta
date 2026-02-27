import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, GripVertical, Search, Coffee, UtensilsCrossed, IceCream, Cake, Wine, Loader2, Upload, X, ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import * as menuApi from "@/api/menuApi";
import { useAuth } from "@/contexts/AuthContext";
import { auditApi } from "@/api/auditApi";

const iconMap: Record<string, any> = {
  Coffee, UtensilsCrossed, IceCream, Cake, Wine
};

export default function AdminMenu() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Category dialog
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<menuApi.MenuCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "Coffee" });

  // Item dialog
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<menuApi.MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    isActive: true,
    image: ""
  });

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'category' | 'item', id: string } | null>(null);

  // ============== QUERIES ==============

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories
  });

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => menuApi.getMenuItems()
  });

  // ============== MUTATIONS ==============

  const RECOMMENDED_CATEGORIES = [
    { name: "Pizzas", icon: "UtensilsCrossed" },
    { name: "Sandwichs", icon: "UtensilsCrossed" },
    { name: "Petit-déjeuner", icon: "Coffee" },
    { name: "Plats", icon: "UtensilsCrossed" },
    { name: "Jus", icon: "Wine" },
    { name: "Boissons", icon: "Coffee" }
  ];

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: menuApi.createCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Catégorie créée", description: "La catégorie a été créée avec succès." });

      // Audit
      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "CRÉATION",
        category: "Menu (Catégories)",
        details: `Création de la catégorie: ${categoryForm.name}`
      });

      setShowCategoryDialog(false);
      setCategoryForm({ name: "", icon: "Coffee" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la catégorie.",
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<menuApi.MenuCategory> }) =>
      menuApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Catégorie modifiée", description: "La catégorie a été modifiée avec succès." });

      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Menu (Catégories)",
        details: `Modification de la catégorie: ${categoryForm.name}`
      });

      setShowCategoryDialog(false);
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier la catégorie.", variant: "destructive" });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: menuApi.deleteCategory,
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Catégorie supprimée", description: "La catégorie a été supprimée avec succès." });

      const category = categories.find(c => c.id === categoryId);
      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Menu (Catégories)",
        details: `Suppression de la catégorie: ${category?.name}`
      });

      setDeleteDialog(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer la catégorie.", variant: "destructive" });
    }
  });

  // Item mutations
  const createItemMutation = useMutation({
    mutationFn: menuApi.createMenuItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Article créé", description: "L'article a été créé avec succès." });

      // Audit
      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "CRÉATION",
        category: "Menu (Articles)",
        details: `Création de l'article: ${itemForm.name}`
      });

      setShowItemDialog(false);
      setItemForm({ name: "", price: "", description: "", category: "", isActive: true, image: "" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer l'article.", variant: "destructive" });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<menuApi.MenuItem> }) =>
      menuApi.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Article modifié", description: "La article a été modifié avec succès." });

      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Menu (Articles)",
        details: `Modification de l'article: ${itemForm.name}`
      });

      setShowItemDialog(false);
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier l'article.", variant: "destructive" });
    }
  });

  const toggleItemMutation = useMutation({
    mutationFn: menuApi.toggleMenuItem,
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Statut modifié", description: "Le statut de l'article a été modifié." });

      const item = menuItems.find(i => i.id === itemId);
      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "MODIFICATION",
        category: "Menu (Articles)",
        details: `${item?.isActive ? "Désactivation" : "Activation"} de l'article: ${item?.name}`
      });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: menuApi.deleteMenuItem,
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast({ title: "Article supprimé", description: "L'article a été supprimé avec succès." });

      const item = menuItems.find(i => i.id === itemId);
      auditApi.recordLog({
        admin: user?.username || "Admin",
        action: "SUPPRESSION",
        category: "Menu (Articles)",
        details: `Suppression de l'article: ${item?.name}`
      });

      setDeleteDialog(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article.", variant: "destructive" });
    }
  });

  // ============== HANDLERS ==============

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const catId = typeof item.category === 'object' ? item.category.id : item.category;
    const matchesCategory = categoryFilter === "all" || catId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Category handlers
  const openCategoryDialog = (category?: menuApi.MenuCategory) => {
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
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  // Item handlers
  const openItemDialog = (item?: menuApi.MenuItem) => {
    if (item) {
      setEditingItem(item);
      const catId = typeof item.category === 'object' ? item.category.id : item.category;
      setItemForm({
        name: item.name,
        price: item.price.toString(),
        description: item.description || "",
        category: catId,
        isActive: item.isActive,
        image: item.image || ""
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: "", price: "", description: "", category: "", isActive: true, image: "" });
    }

    // Set preview if editing existing item
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setImagePreview(item?.image ? `${apiUrl}${item.image.startsWith('/') ? '' : '/'}${item.image}` : null);
    setSelectedFile(null);
    setShowItemDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Fichier trop volumineux", description: "La taille maximale est de 5Mo", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setItemForm({ ...itemForm, image: "" });
  };

  const handleSaveItem = async () => {
    try {
      setIsUploading(true);
      let imageUrl = editingItem?.image || "";

      // Upload image if a new file is selected
      if (selectedFile) {
        const uploadRes = await menuApi.uploadImage(selectedFile);
        imageUrl = uploadRes.url;
      }

      const itemData = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        image: imageUrl
      };

      if (editingItem) {
        updateItemMutation.mutate({ id: editingItem.id, data: itemData });
      } else {
        createItemMutation.mutate(itemData);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image ou d'enregistrer l'article.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleItemActive = (item: menuApi.MenuItem) => {
    toggleItemMutation.mutate(item.id);
  };

  const handleDelete = () => {
    if (deleteDialog) {
      if (deleteDialog.type === 'category') {
        deleteCategoryMutation.mutate(deleteDialog.id);
      } else {
        deleteItemMutation.mutate(deleteDialog.id);
      }
    }
  };

  // Loading state
  if (categoriesLoading || itemsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
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
              <div className="text-2xl font-bold">{categories.length}</div>
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
                      <SelectItem value="all" key="all">Toutes les catégories</SelectItem>
                      {categories.map(cat => (
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
                        const category = typeof item.category === 'object' ? item.category : categories.find(c => c.id === item.category);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                                  {item.image ? (
                                    <img
                                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                      <ImageIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{category?.name}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.price} DT</TableCell>
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
                <div className="space-y-1">
                  <CardTitle>Catégories</CardTitle>
                  <CardDescription>Gérez les sections de votre menu</CardDescription>
                </div>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle catégorie
                </Button>
              </CardHeader>
              <CardContent>
                {/* Recommended Categories Quick Add */}
                <div className="mb-8 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    Catégories recommandées (Ajout rapide)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {RECOMMENDED_CATEGORIES.map((cat) => {
                      const Icon = iconMap[cat.icon] || Coffee;
                      const exists = categories.some(c => c.name.toLowerCase() === cat.name.toLowerCase());
                      return (
                        <Button
                          key={cat.name}
                          variant="outline"
                          size="sm"
                          className="bg-background hover:bg-accent/10 hover:text-accent hover:border-accent group"
                          disabled={exists || createCategoryMutation.isPending}
                          onClick={() => createCategoryMutation.mutate(cat)}
                        >
                          <Icon className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-accent" />
                          {cat.name}
                          {exists && <span className="ml-2 text-[10px] text-muted-foreground">(Déjà ajoutée)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
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
                      {categories.sort((a, b) => a.order - b.order).map((category) => {
                        const IconComponent = iconMap[category.icon] || Coffee;
                        const itemCount = menuItems.filter(i => {
                          const catId = typeof i.category === 'object' ? i.category.id : i.category;
                          return catId === category.id;
                        }).length;

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
              <DialogDescription>
                {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour organiser vos articles'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la catégorie *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Boissons Chaudes"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Icône (optionnel)</Label>
                <Select
                  value={categoryForm.icon}
                  onValueChange={(v) => setCategoryForm({ ...categoryForm, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = iconMap[categoryForm.icon] || Coffee;
                          return (
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{categoryForm.icon}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </SelectValue>
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
              <Button
                onClick={handleSaveCategory}
                disabled={!categoryForm.name.trim()}
              >
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Item Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <div className="p-6 pb-2">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
                </DialogTitle>
                <DialogDescription>
                  {categories.length === 0
                    ? '⚠️ Créez d\'abord une catégorie avant d\'ajouter des articles'
                    : editingItem ? 'Modifiez les informations de l\'article' : 'Ajoutez un nouvel article au menu'
                  }
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              <div className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>Nom de l'article *</Label>
                  <Input
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="Ex: Café Express"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select
                    value={itemForm.category}
                    onValueChange={(v) => setItemForm({ ...itemForm, category: v })}
                    disabled={categories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categories.length === 0 ? "Aucune catégorie disponible" : "Sélectionner une catégorie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prix (DT) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
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
                  <Label>Article actif (visible pour les clients)</Label>
                </div>

                {/* Image Upload Field */}
                <div className="space-y-2 pt-2">
                  <Label>Image de l'article</Label>
                  <div className="flex flex-col gap-4">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center px-4">Cliquez pour ajouter une image</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG ou JPEG (max. 5Mo)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 border-t mt-auto">
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowItemDialog(false)} disabled={isUploading}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveItem}
                  disabled={!itemForm.name.trim() || !itemForm.category || !itemForm.price || categories.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    editingItem ? 'Modifier' : 'Créer'
                  )}
                </Button>
              </DialogFooter>
            </div>
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
