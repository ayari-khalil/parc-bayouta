module.exports.toJSON = require('./plugins/toJSON.plugin');
module.exports.paginate = require('./plugins/paginate.plugin');

const { Field, FieldReservation } = require('./field.model');
const { Event, EventReservation } = require('./event.model');
const { MenuCategory, MenuItem } = require('./menu.model');
const HallReservation = require('./hallReservation.model');
const ContactMessage = require('./contact.model');
const Order = require('./order.model');
const Notification = require('./notification.model');

module.exports = {
    Field,
    FieldReservation,
    Event,
    EventReservation,
    MenuCategory,
    MenuItem,
    HallReservation,
    ContactMessage,
    Order,
    Notification,
};
