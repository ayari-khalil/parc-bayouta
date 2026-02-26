const mongoose = require('mongoose');
const config = require('./config/config');
const { Hall } = require('./models');

const seedHalls = async () => {
    try {
        console.log('Connecting to:', config.mongoose.url);
        await mongoose.connect(config.mongoose.url, config.mongoose.options);

        console.log('Connected to MongoDB');

        // Check if halls already exist
        const Count = await Hall.countDocuments();
        if (Count > 0) {
            console.log(`Found ${Count} halls. Skipping seeding.`);
        } else {
            const halls = await Hall.create([
                { name: 'Salle des Fêtes 1', status: 'active' },
                { name: 'Salle des Fêtes 2', status: 'active' },
            ]);
            console.log('Halls seeded successfully:', halls);
        }

        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR SEEDING HALLS:');
        console.error(error);
        process.exit(1);
    }
};

seedHalls();
