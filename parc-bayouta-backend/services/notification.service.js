const { Notification } = require('../models');

/**
 * Create a notification (e.g. waiter call)
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
    return Notification.create(notificationBody);
};

/**
 * Get all notifications
 * @returns {Promise<QueryResult>}
 */
const getAllNotifications = async (filter = {}) => {
    return Notification.find(filter).sort({ createdAt: -1 });
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */
const markAsRead = async (notificationId) => {
    return Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};

/**
 * Call a waiter
 * @param {string} tableNumber
 * @returns {Promise<Notification>}
 */
const callWaiter = async (tableNumber) => {
    return createNotification({
        type: 'waiter_call',
        tableNumber,
        message: `La Table ${tableNumber} appelle un serveur`,
    });
};

/**
 * Request the bill
 * @param {string} tableNumber
 * @returns {Promise<Notification>}
 */
const requestBill = async (tableNumber) => {
    return createNotification({
        type: 'bill_request',
        tableNumber,
        message: `La Table ${tableNumber} demande l'addition`,
    });
};

module.exports = {
    createNotification,
    getAllNotifications,
    markAsRead,
    callWaiter,
    requestBill,
};
