const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const hallReservationSchema = mongoose.Schema(
    {
        hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
        date: { type: Date, required: true },
        customerName: { type: String, required: function () { return this.status !== 'blocked'; } },
        customerPhone: { type: String, required: function () { return this.status !== 'blocked'; } },
        eventType: { type: String, required: function () { return this.status !== 'blocked'; } },
        guestCount: { type: Number, required: function () { return this.status !== 'blocked'; } },
        message: { type: String },
        status: { type: String, enum: ['pending', 'confirmed', 'canceled', 'blocked'], default: 'pending' },
    },
    { timestamps: true }
);

hallReservationSchema.plugin(toJSON);
hallReservationSchema.plugin(paginate);

const HallReservation = mongoose.model('HallReservation', hallReservationSchema);

module.exports = HallReservation;
