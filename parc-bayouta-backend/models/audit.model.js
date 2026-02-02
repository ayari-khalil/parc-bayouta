const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const auditSchema = new mongoose.Schema({
    admin: {
        type: String, // username
        required: true,
    },
    action: {
        type: String, // e.g., "CREATE", "UPDATE", "DELETE"
        required: true,
    },
    category: {
        type: String, // e.g., "Field Reservations", "Menu", "Events"
        required: true,
    },
    details: {
        type: String, // Description of what happened
        required: true,
    },
}, {
    timestamps: true,
});

auditSchema.plugin(toJSON);
auditSchema.plugin(paginate);

const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
