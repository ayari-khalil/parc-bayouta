const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MenuCategory, MenuItem } = require('../models/menu.model');

const MONGO_URI = process.env.MONGODB_URL;

const categories = [
    {
        name: 'Pizzas',
        icon: 'Pizza',
        order: 1,
        items: [
            { name: 'Pizza Marguerite', price: 15 },
            { name: 'Pizza Neptune', price: 17 },
            { name: 'Pizza Escalope', price: 18 },
            { name: 'Pizza Chawarma', price: 18 },
            { name: 'Pizza Végétarienne', price: 17 },
            { name: 'Pizza Réne', price: 18 },
            { name: 'Pizza 4 Saisons', price: 20 },
            { name: 'Pizza 4 Fromages', price: 20 },
            { name: 'Pizza Pepperoni', price: 22 },
            { name: 'Pizza Roquette Parmesan & Bresaola', price: 22 }
        ]
    },

    {
        name: 'Makloub',
        icon: 'Sandwich',
        order: 2,
        items: [
            { name: 'Makloub Chawarma', price: 14 },
            { name: 'Makloub Escalope grillée', price: 14 },
            { name: 'Makloub Escalope panée', price: 15 },
            { name: 'Makloub Cordon Bleu', price: 15 }
        ]
    },

    {
        name: 'Cornet',
        icon: 'Sandwich',
        order: 3,
        items: [
            { name: 'Cornet Chawarma', price: 14 },
            { name: 'Cornet Escalope grillée', price: 14 },
            { name: 'Cornet Escalope panée', price: 15 },
            { name: 'Cornet Cordon Bleu', price: 15 }
        ]
    },

    {
        name: 'Baguette Farcie',
        icon: 'Sandwich',
        order: 4,
        items: [
            { name: 'Baguette Chawarma', price: 14 },
            { name: 'Baguette Escalope grillée', price: 14 },
            { name: 'Baguette Escalope panée', price: 15 },
            { name: 'Baguette Cordon Bleu', price: 15 }
        ]
    },

    {
        name: 'Plats',
        icon: 'UtensilsCrossed',
        order: 5,
        items: [
            { name: 'Poulet Grillé', price: 20 },
            { name: 'Chawarma', price: 22 },
            { name: 'Escalope Grillée', price: 20 },
            { name: 'Escalope Panée', price: 23 },
            { name: 'Cordon Bleu', price: 24 },
            { name: 'Merguez', price: 23 },
            { name: 'Grillade Mixte', price: 35 },
            { name: 'Côtelette d’Agneau', price: 40 },
            { name: 'Steak de Bœuf', price: 30 },
            { name: 'Foie de Bœuf', price: 30 },
            { name: 'Poisson (Dorade / Loup)', price: 28 },
            { name: 'Menu Enfant', price: 10 }
        ]
    },

    {
        name: 'Cafés & Boissons Chaudes',
        icon: 'Coffee',
        order: 6,
        items: [
            { name: 'Express', price: 3 },
            { name: 'Capucin', price: 4 },
            { name: 'Direct', price: 4.5 },
            { name: 'Américain', price: 4 },
            { name: 'Iced Coffee', price: 5 },
            { name: 'Caramel Iced Coffee', price: 6 },
            { name: 'Latte Caramel Pop Corn', price: 7 },
            { name: 'Chocolat Chaud', price: 7 },
            { name: 'Nescafé', price: 5 },
            { name: 'Café Turc', price: 5 }
        ]
    },

    {
        name: 'Milkshakes',
        icon: 'IceCream',
        order: 7,
        items: [
            { name: 'Vanille', price: 9 },
            { name: 'Fraise', price: 10 },
            { name: 'Chocolat', price: 10 },
            { name: 'Oreo', price: 10 },
            { name: 'Nutella', price: 12 },
            { name: 'Speculoos', price: 12 },
            { name: 'Chocolat Liégeois', price: 12 }
        ]
    },

    {
        name: 'Boissons Fraîches',
        icon: 'GlassWater',
        order: 8,
        items: [
            { name: 'Eau Minérale 1L', price: 2.5 },
            { name: 'Eau Gazeuse', price: 3 },
            { name: 'Boisson Gazeuse', price: 3.5 },
            { name: 'Citronnade', price: 4.5 },
            { name: 'Citronnade aux amandes', price: 5.5 },
            { name: 'Jus de Fraise', price: 8 }
        ]
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        console.log('Deleting old menu...');
        await MenuItem.deleteMany({});
        await MenuCategory.deleteMany({});

        for (const cat of categories) {
            const { items, ...categoryData } = cat;
            const category = await MenuCategory.create(categoryData);

            await MenuItem.insertMany(
                items.map(item => ({
                    ...item,
                    category: category._id,
                    isActive: true
                }))
            );

            console.log(`✔ ${category.name} seeded`);
        }

        console.log('✅ Menu seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}

seed();
