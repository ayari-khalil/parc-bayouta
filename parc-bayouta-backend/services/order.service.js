const { Order, Notification } = require('../models');

/**
 * Create an order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
    const order = await Order.create(orderBody);

    // Create a notification for the admin
    await Notification.create({
        type: 'order',
        tableNumber: order.tableNumber,
        message: `Nouvelle commande de la Table ${order.tableNumber} - Total: ${order.totalAmount} DT`,
    });

    return order;
};

/**
 * Get all orders
 * @returns {Promise<QueryResult>}
 */
const getAllOrders = async (filter = {}) => {
    return Order.find(filter).sort({ createdAt: -1 });
};

/**
 * Update order status
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderStatus = async (orderId, updateBody) => {
    const order = await Order.findByIdAndUpdate(orderId, updateBody, { new: true });
    return order;
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus,
};
