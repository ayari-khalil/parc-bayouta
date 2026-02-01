const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const fieldSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
    },
    { timestamps: true }
);

fieldSchema.plugin(toJSON);
fieldSchema.plugin(paginate);

const fieldReservationSchema = mongoose.Schema(
    {
        field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true }, // e.g. "09:00"
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
        isRecurring: { type: Boolean, default: false },
        recurringGroupId: { type: String, default: null },
    },
    { timestamps: true }
);

fieldReservationSchema.plugin(toJSON);
fieldReservationSchema.plugin(paginate);

const Field = mongoose.model('Field', fieldSchema);
const FieldReservation = mongoose.model('FieldReservation', fieldReservationSchema);

module.exports = { Field, FieldReservation };
