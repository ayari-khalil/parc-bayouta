import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Cake, IceCream, Wine, Download, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import * as menuApi from "@/api/menuApi";
import cafeImg from "@/assets/cafe-restaurant.jpg";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  IceCream,
  UtensilsCrossed,
  Wine,
  Cake,
};

export default function CafeRestaurant() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategory === null ? (
              // Show categories with items
              activeCategories.map((category, index) => {
                const Icon = iconMap[category.icon] || Coffee;
                const categoryId = category.id;
                const items = allMenuItems.filter(item => {
                  const itemCatId = typeof item.category === 'object' ? item.category.id : item.category;
                  return itemCatId === categoryId;
                });

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl shadow-card p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {category.name}
                      </h3>
                    </div>

                    <ul className="space-y-3 flex-grow">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{item.name}</span>
                          <span className="font-medium text-accent">{item.price} DT</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })
            ) : (
              // Show filtered items
              <div className="col-span-full">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-xl shadow-soft p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <span className="font-bold text-accent whitespace-nowrap ml-4">
                        {item.price} DT
                      </span>
                    </motion.div>
                  ))}
                </div>
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
    </PublicLayout>
  );
}
