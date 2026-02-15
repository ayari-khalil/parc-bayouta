const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const notificationSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['order', 'waiter_call', 'bill_request'],
            required: true,
        },
        tableNumber: { type: String, required: true },
        message: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
