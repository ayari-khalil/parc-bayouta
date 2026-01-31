require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoose: {
        url: process.env.MONGODB_URL,
        options: {}
    }
};
