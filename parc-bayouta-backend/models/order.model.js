const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
    {
        items: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
            }
        ],
        tableNumber: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'preparing', 'completed', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
