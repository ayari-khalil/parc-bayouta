const { Event, EventReservation } = require('../models/event.model');

/**
 * Create an event
 * @param {Object} eventBody
 * @returns {Promise<Event>}
 */
const createEvent = async (eventBody) => {
    return Event.create(eventBody);
};

/**
 * Query for events
 * @returns {Promise<QueryResult>}
 */
const queryEvents = async () => {
    return Event.find().sort({ createdAt: -1 });
};

/**
 * Get event by id
 * @param {ObjectId} id
 * @returns {Promise<Event>}
 */
const getEventById = async (id) => {
    return Event.findById(id);
};

/**
 * Update event by id
 * @param {ObjectId} eventId
 * @param {Object} updateBody
 * @returns {Promise<Event>}
 */
const updateEventById = async (eventId, updateBody) => {
    const event = await getEventById(eventId);
    if (!event) {
        throw new Error('Event not found');
    }
    Object.assign(event, updateBody);
    await event.save();
    return event;
};

/**
 * Delete event by id
 * @param {ObjectId} eventId
 * @returns {Promise<Event>}
 */
const deleteEventById = async (eventId) => {
    const event = await getEventById(eventId);
    if (!event) {
        throw new Error('Event not found');
    }
    await event.remove ? await event.remove() : await Event.deleteOne({ _id: eventId });
    return event;
};

/**
 * Create a reservation
 * @param {Object} reservationBody
 * @returns {Promise<EventReservation>}
 */
const createReservation = async (reservationBody) => {
    const event = await getEventById(reservationBody.event);
    if (!event) {
        throw new Error('Event not found');
    }

    const reservation = await EventReservation.create(reservationBody);

    // Update event capacity
    event.currentReservations += reservationBody.attendees;
    await event.save();

    return reservation;
};

/**
 * Query for reservations
 * @returns {Promise<QueryResult>}
 */
const queryReservations = async () => {
    return EventReservation.find().populate('event').sort({ createdAt: -1 });
};

/**
 * Update reservation status
 * @param {ObjectId} reservationId
 * @param {string} status
 * @returns {Promise<EventReservation>}
 */
const updateReservationStatus = async (reservationId, status) => {
    const reservation = await EventReservation.findById(reservationId);
    if (!reservation) {
        throw new Error('Reservation not found');
    }
    reservation.status = status;
    await reservation.save();
    return reservation;
};

/**
 * Delete reservation by id
 * @param {ObjectId} reservationId
 * @returns {Promise<EventReservation>}
 */
const deleteReservationById = async (reservationId) => {
    const reservation = await EventReservation.findById(reservationId);
    if (!reservation) {
        throw new Error('Reservation not found');
    }

    // Adjust event capacity if it was not canceled
    if (reservation.status !== 'canceled') {
        const event = await getEventById(reservation.event);
        if (event) {
            event.currentReservations -= reservation.attendees;
            await event.save();
        }
    }

    await EventReservation.deleteOne({ _id: reservationId });
    return reservation;
};

module.exports = {
    createEvent,
    queryEvents,
    getEventById,
    updateEventById,
    deleteEventById,
    createReservation,
    queryReservations,
    updateReservationStatus,
    deleteReservationById
};
