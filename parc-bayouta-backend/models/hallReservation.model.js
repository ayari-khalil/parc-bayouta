const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const hallReservationSchema = mongoose.Schema(
    {
        date: { type: Date, required: true },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        eventType: { type: String, required: true },
        guestCount: { type: Number, required: true },
        message: { type: String },
        status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    },
    { timestamps: true }
);

hallReservationSchema.plugin(toJSON);
hallReservationSchema.plugin(paginate);

const HallReservation = mongoose.model('HallReservation', hallReservationSchema);

module.exports = HallReservation;
