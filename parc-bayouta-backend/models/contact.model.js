const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const contactMessageSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, trim: true, lowercase: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['new', 'processed', 'archived'], default: 'new' },
    },
    { timestamps: true }
);

contactMessageSchema.plugin(toJSON);
contactMessageSchema.plugin(paginate);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

module.exports = ContactMessage;
