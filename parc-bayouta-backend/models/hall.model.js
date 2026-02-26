const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const hallSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
    },
    { timestamps: true }
);

hallSchema.plugin(toJSON);
hallSchema.plugin(paginate);

const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall;
