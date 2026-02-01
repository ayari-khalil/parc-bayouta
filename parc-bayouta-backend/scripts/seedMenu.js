const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MenuCategory, MenuItem } = require('../models/menu.model');

const MONGO_URI = process.env.MONGODB_URL;

const categories = [
    {
        name: 'Pizzas',
        icon: 'UtensilsCrossed',
        order: 1,
        items: [
            { name: 'Pizza Marguerite', price: 12.5, description: 'Sauce tomate, mozzarella, basilic frais, huile d\'olive' },
            { name: 'Pizza 4 Saisons', price: 16.5, description: 'Sauce tomate, mozzarella, champignons, artichauts, jambon, olives' },
            { name: 'Pizza Thon', price: 15.0, description: 'Sauce tomate, mozzarella, thon, oignons, olives' },
            { name: 'Pizza Fruits de Mer', price: 24.5, description: 'Sauce tomate, mozzarella, mélange de fruits de mer, ail, persillade' },
            { name: 'Pizza Viande Hachée', price: 18.0, description: 'Sauce tomate, mozzarella, viande hachée assaisonnée, poivrons' },
            { name: 'Pizza Poulet', price: 17.0, description: 'Sauce crème ou tomate, mozzarella, poulet grillé, champignons' }
        ]
    },
    {
        name: 'Sandwichs',
        icon: 'UtensilsCrossed',
        order: 2,
        items: [
            { name: 'Sandwich Thon Académique', price: 6.5, description: 'Thon, œuf, salade méchouia, pommes de terre, olives' },
            { name: 'Sandwich Escalope', price: 9.5, description: 'Escalope de poulet grillée, frites, salade, sauces au choix' },
            { name: 'Sandwich Chawarma Poulet', price: 10.5, description: 'Poulet mariné, crème d\'ail, cornichons, frites' },
            { name: 'Libanais Mixte', price: 12.0, description: 'Viande et poulet, persil, oignons, sauce tarator' },
            { name: 'Makloub Poulet', price: 9.0, description: 'Pâte à pizza pliée, poulet, fromage, salade, frites' }
        ]
    },
    {
        name: 'Petit-déjeuner',
        icon: 'Coffee',
        order: 3,
        items: [
            { name: 'Petit-déjeuner Tunisien', price: 14.5, description: 'Assiette de chamia, beurre, miel, huile d\'olive, œuf, café au lait' },
            { name: 'Petit-déjeuner Express', price: 7.5, description: 'Café au choix, croissant ou pain au chocolat, jus d\'orange frais' },
            { name: 'Omelette Nature', price: 6.0, description: 'Deux œufs, servie avec pain frais' },
            { name: 'Omelette Fromage / Jambon', price: 8.5, description: 'Deux œufs, fromage fondu, jambon de dinde' },
            { name: 'Crêpe Sucrée Nutella', price: 9.0, description: 'Crêpe faite maison, généreuse couche de Nutella' }
        ]
    },
    {
        name: 'Plats',
        icon: 'UtensilsCrossed',
        order: 4,
        items: [
            { name: 'Couscous au Poisson', price: 28.0, description: 'Couscous traditionnel, poisson frais du jour, légumes de saison' },
            { name: 'Pâtes au Fruit de Mer', price: 22.5, description: 'Spaghetti ou Penne, sauce tomate piquante, crevettes, moules, calamars' },
            { name: 'Escalope Panée', price: 19.5, description: 'Servie avec frites, riz et salade variée' },
            { name: 'Entrecôte Grillée', price: 29.5, description: 'Pièce de bœuf tendre, sauce poivre ou champignons, garniture au choix' },
            { name: 'Ojja Royale', price: 18.5, description: 'Œufs pochés en sauce tomate, merguez, crevettes' }
        ]
    },
    {
        name: 'Jus & Smoothies',
        icon: 'Wine',
        order: 5,
        items: [
            { name: 'Jus d\'Orange Frais', price: 6.5, description: 'Pressé à la minute' },
            { name: 'Citronnade Maison', price: 5.5, description: 'Citrons frais, menthe, servi bien frais' },
            { name: 'Smoothie Fraise-Banane', price: 9.5, description: 'Fruits frais mixés avec du lait ou yaourt' },
            { name: 'Jus Panaché', price: 10.0, description: 'Mélange de fruits de saison' },
            { name: 'Cocktail Bayouta', price: 12.5, description: 'Spécialité de la maison, fruits secs et miel' }
        ]
    },
    {
        name: 'Boissons',
        icon: 'Coffee',
        order: 6,
        items: [
            { name: 'Café Express', price: 2.5, description: 'Espresso intense' },
            { name: 'Café Direct / Crème', price: 3.2, description: 'Espresso avec une touche de lait' },
            { name: 'Thé à la Menthe', price: 2.0, description: 'Thé vert traditionnel tunisien' },
            { name: 'Thé aux Pignons', price: 4.5, description: 'Thé à la menthe servi avec des pignons royaux' },
            { name: 'Eau Minérale (0.5L)', price: 1.5, description: 'Bouteille d\'eau fraîche' },
            { name: 'Soda (Canette)', price: 3.5, description: 'Coca-Cola, Fanta, Bogua' }
        ]
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully.');

        // Clear existing data
        console.log('Clearing existing menu data...');
        await MenuCategory.deleteMany({});
        await MenuItem.deleteMany({});
        console.log('Data cleared.');

        // Seed categories and items
        for (const catData of categories) {
            const { items, ...categoryFields } = catData;

            const category = await MenuCategory.create(categoryFields);
            console.log(`Created category: ${category.name}`);

            const itemsToCreate = items.map(item => ({
                ...item,
                category: category._id,
                isActive: true
            }));

            await MenuItem.insertMany(itemsToCreate);
            console.log(`Added ${itemsToCreate.length} items to ${category.name}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
