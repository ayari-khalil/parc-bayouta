const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        unique: true,
    },
    count: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
