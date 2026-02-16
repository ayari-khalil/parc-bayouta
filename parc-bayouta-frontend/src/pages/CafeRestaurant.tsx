import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Cake, IceCream, Wine, Download, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import * as menuApi from "@/api/menuApi";
import cafeImg from "@/assets/cafe-restaurant.jpg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  IceCream,
  UtensilsCrossed,
  Wine,
  Cake,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CafeRestaurant() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<menuApi.MenuItem | null>(null);

  // Fetch categories and menu items
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: menuApi.getCategories
  });

  const { data: allMenuItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['publicMenuItems'],
    queryFn: () => menuApi.getPublicMenuItems()
  });

  // Filter active categories and items
  const activeCategories = categories.filter(c => c.isActive).sort((a, b) => a.order - b.order);

  const filteredItems = activeCategory
    ? allMenuItems.filter(item => {
      const categoryId = typeof item.category === 'object' ? item.category.id : item.category;
      return categoryId === activeCategory;
    })
    : allMenuItems;

  // Loading state
  if (categoriesLoading || itemsLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center h-64 mt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-accent/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
              Restauration
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Café-Restaurant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Savourez nos spécialités dans un cadre chaleureux et convivial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden h-64 md:h-80"
          >
            <img
              src={cafeImg}
              alt="Café-Restaurant Parc Bayouta"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent flex items-center">
              <div className="p-8 md:p-12">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  Notre Menu
                </h3>
                <p className="text-primary-foreground/90 max-w-md mb-4">
                  Des produits frais et de qualité, préparés avec soin chaque jour
                </p>
                <Button variant="heroOutline" size="lg">
                  <Download className="w-5 h-5" />
                  Télécharger le menu PDF
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
            >
              Tout
            </Button>
            {activeCategories.map((category) => {
              const Icon = iconMap[category.icon] || Coffee;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="flex flex-col gap-12">
            {activeCategory === null ? (
              // Show sections for each category
              activeCategories.map((category, catIndex) => {
                const Icon = iconMap[category.icon] || Coffee;
                const items = allMenuItems.filter(item => {
                  const itemCatId = typeof item.category === 'object' ? item.category.id : item.category;
                  return itemCatId === category.id;
                });

                if (items.length === 0) return null;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.1 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                          {category.name}
                        </h2>
                        <div className="h-1 w-12 bg-accent mt-1 rounded-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -5 }}
                          className="group relative bg-card rounded-xl md:rounded-2xl shadow-soft overflow-hidden hover:shadow-card transition-all cursor-pointer border border-border/50"
                          onClick={() => setSelectedProduct(item)}
                        >
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            {item.image ? (
                              <img
                                src={`${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                <Icon className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <span className="text-white text-xs md:text-sm font-medium flex items-center gap-2">
                                <Info className="w-4 h-4" /> Voir détails
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 md:p-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 md:mb-2">
                              <h3 className="font-bold text-sm md:text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                {item.name}
                              </h3>
                              <span className="font-display text-sm md:text-lg font-bold text-accent whitespace-nowrap sm:ml-2">
                                {item.price} DT
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Filtered View
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {filteredItems.map((item, index) => {
                  const Icon = iconMap[activeCategories.find(c => c.id === activeCategory)?.icon || 'Coffee'] || Coffee;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group relative bg-card rounded-xl md:rounded-2xl shadow-soft overflow-hidden hover:shadow-card transition-all cursor-pointer border border-border/50"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {item.image ? (
                          <img
                            src={`${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                            <Icon className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs md:text-sm font-medium flex items-center gap-2">
                            <Info className="w-4 h-4" /> Voir détails
                          </span>
                        </div>
                      </div>

                      <div className="p-3 md:p-5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 md:mb-2">
                          <h3 className="font-bold text-sm md:text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="font-display text-sm md:text-lg font-bold text-accent whitespace-nowrap sm:ml-2">
                            {item.price} DT
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-card rounded-2xl shadow-card p-8 max-w-2xl mx-auto">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Service Traiteur
              </h3>
              <p className="text-muted-foreground mb-6">
                Besoin d'un service traiteur pour votre événement ? Contactez-nous pour un devis personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="accent" size="lg" asChild>
                  <a href="tel:+21655512345">
                    <Phone className="w-5 h-5" />
                    Appeler maintenant
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://wa.me/21655512345" target="_blank" rel="noopener noreferrer">
                    Contacter via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Details Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-none">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Side */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-muted">
                {selectedProduct.image ? (
                  <img
                    src={`${API_URL}${selectedProduct.image.startsWith('/') ? '' : '/'}${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    {(() => {
                      const Icon = iconMap[categories.find(c => {
                        const catId = typeof selectedProduct.category === 'object' ? selectedProduct.category.id : selectedProduct.category;
                        return c.id === catId;
                      })?.icon || 'Coffee'] || Coffee;
                      return <Icon className="w-20 h-20" />;
                    })()}
                  </div>
                )}
              </div>

              {/* Info Side */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                <div className="mb-6">
                  <Badge variant="default" className="mb-4">
                    {typeof selectedProduct.category === 'object' ? selectedProduct.category.name : categories.find(c => c.id === selectedProduct.category)?.name}
                  </Badge>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    {selectedProduct.name}
                  </h2>
                  <div className="text-2xl font-display font-bold text-accent">
                    {selectedProduct.price} DT
                  </div>
                </div>

                {selectedProduct.description && (
                  <div className="mb-8">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Description
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <Button
                  variant="accent"
                  size="lg"
                  className="w-full rounded-2xl h-14 text-lg font-bold"
                  onClick={() => {
                    // Navigate to ordering page or just close for now
                    window.location.href = '/order';
                  }}
                >
                  Commander maintenant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
