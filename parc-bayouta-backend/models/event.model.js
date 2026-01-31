const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const eventSchema = mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        longDescription: { type: String },
        image: { type: String },
        date: { type: String, required: true }, // Keeping as string to match mock, or Date? keeping string simple for now or Date for query
        time: { type: String, required: true },
        endTime: { type: String },
        category: {
            type: String,
            enum: ['movie', 'gaming', 'party', 'kids', 'tournament', 'special'],
            required: true
        },
        price: { type: Number, required: true },
        maxCapacity: { type: Number, required: true },
        currentReservations: { type: Number, default: 0 },
        location: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

eventSchema.plugin(toJSON);
eventSchema.plugin(paginate);

const eventReservationSchema = mongoose.Schema(
    {
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerEmail: { type: String, trim: true, lowercase: true },
        attendees: { type: Number, required: true, min: 1 },
        status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    },
    { timestamps: true }
);

eventReservationSchema.plugin(toJSON);
eventReservationSchema.plugin(paginate);

const Event = mongoose.model('Event', eventSchema);
const EventReservation = mongoose.model('EventReservation', eventReservationSchema);

module.exports = { Event, EventReservation };
