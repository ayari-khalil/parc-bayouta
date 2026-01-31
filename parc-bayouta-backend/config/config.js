const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
    port: process.env.PORT || 5000,
    mongoose: {
        url: process.env.MONGODB_URL,
        options: {}
    }
};
