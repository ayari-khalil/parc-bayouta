import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Cake, IceCream, Wine, Download } from "lucide-react";
import { Button } from "./ui/button";
import cafeImg from "@/assets/cafe-restaurant.jpg";

const menuCategories = [
  {
    id: "boissons-chaudes",
    name: "Boissons Chaudes",
    icon: Coffee,
    items: [
      { name: "Café Express", price: "100 DA" },
      { name: "Café Crème", price: "150 DA" },
      { name: "Cappuccino", price: "200 DA" },
      { name: "Thé à la menthe", price: "100 DA" },
      { name: "Chocolat Chaud", price: "180 DA" },
    ],
  },
  {
    id: "boissons-froides",
    name: "Boissons Fraîches",
    icon: IceCream,
    items: [
      { name: "Jus d'orange frais", price: "150 DA" },
      { name: "Limonade maison", price: "120 DA" },
      { name: "Smoothie fruits", price: "250 DA" },
      { name: "Milkshake", price: "280 DA" },
      { name: "Eau minérale", price: "60 DA" },
    ],
  },
  {
    id: "snacks",
    name: "Snacks & Sandwichs",
    icon: UtensilsCrossed,
    items: [
      { name: "Sandwich poulet", price: "350 DA" },
      { name: "Panini thon", price: "300 DA" },
      { name: "Croque-monsieur", price: "280 DA" },
      { name: "Salade César", price: "400 DA" },
      { name: "Pizza individuelle", price: "450 DA" },
    ],
  },
  {
    id: "plats",
    name: "Plats du Jour",
    icon: Wine,
    items: [
      { name: "Couscous (Vendredi)", price: "600 DA" },
      { name: "Grillades mixtes", price: "800 DA" },
      { name: "Escalope panée", price: "550 DA" },
      { name: "Tajine poulet", price: "650 DA" },
      { name: "Pâtes bolognaise", price: "450 DA" },
    ],
  },
  {
    id: "patisseries",
    name: "Pâtisseries & Desserts",
    icon: Cake,
    items: [
      { name: "Croissant", price: "80 DA" },
      { name: "Pain au chocolat", price: "100 DA" },
      { name: "Gâteau du jour", price: "150 DA" },
      { name: "Crêpe Nutella", price: "200 DA" },
      { name: "Glace (2 boules)", price: "180 DA" },
    ],
  },
];

export const CafeMenu = () => {
  return (
    <section id="cafe" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
            Restauration
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Café-Restaurant
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Savourez nos spécialités dans un cadre chaleureux et convivial
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-12 h-64 md:h-80"
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

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl shadow-card p-6 card-hover"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {category.name}
                </h3>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {category.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">{item.name}</span>
                    <span className="font-medium text-accent">{item.price}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Besoin d'un service traiteur pour votre événement ?
          </p>
          <Button variant="accent" size="lg" onClick={() => {
            const element = document.querySelector("#contact");
            if (element) element.scrollIntoView({ behavior: "smooth" });
          }}>
            <UtensilsCrossed className="w-5 h-5" />
            Commander pour un événement
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
