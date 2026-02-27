const { Field, FieldReservation } = require('../models/field.model');

/**
 * Get all fields
 * @returns {Promise<Array<Field>>}
 */
const getFields = async () => {
    return Field.find();
};

/**
 * Create a field reservation
 * @param {Object} reservationBody
 * @returns {Promise<FieldReservation>}
 */
const createReservation = async (reservationBody) => {
    if (!reservationBody.isRecurring) {
        return FieldReservation.create(reservationBody);
    }

    const reservations = [];
    const recurringGroupId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseDate = new Date(reservationBody.date);

    // Create 4 weekly reservations
    for (let i = 0; i < 4; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + (i * 7));

        // Check if slot is already taken
        const existingRec = await FieldReservation.findOne({
            field: reservationBody.field,
            date: currentDate,
            timeSlot: reservationBody.timeSlot,
            status: { $ne: 'canceled' }
        });

        if (existingRec) {
            throw new Error(`Le créneau du ${currentDate.toLocaleDateString()} est déjà réservé.`);
        }

        reservations.push({
            ...reservationBody,
            date: currentDate,
            isRecurring: true,
            recurringGroupId
        });
    }

    return FieldReservation.insertMany(reservations);
};

/**
 * Query for field reservations
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryReservations = async (filter, options) => {
    const reservations = await FieldReservation.paginate(filter, options);
    return reservations;
};

/**
 * Get all field reservations (non-paginated)
 * @returns {Promise<Array<FieldReservation>>}
 */
const getAllReservations = async () => {
    return FieldReservation.find().populate('field').sort({ date: 1, timeSlot: 1 });
};

/**
 * Get field reservation by id
 * @param {ObjectId} id
 * @returns {Promise<FieldReservation>}
 */
const getReservationById = async (id) => {
    return FieldReservation.findById(id).populate('field');
};

/**
 * Update field reservation by id
 * @param {ObjectId} reservationId
 * @param {Object} updateBody
 * @returns {Promise<FieldReservation>}
 */
const updateReservationById = async (reservationId, updateBody) => {
    const reservation = await getReservationById(reservationId);
    if (!reservation) {
        throw new Error('Reservation not found');
    }
    Object.assign(reservation, updateBody);
    await reservation.save();
    return reservation;
};

/**
 * Delete field reservation by id
 * @param {ObjectId} reservationId
 * @returns {Promise<FieldReservation>}
 */
const deleteReservationById = async (reservationId) => {
    const reservation = await getReservationById(reservationId);
    if (!reservation) {
        throw new Error('Reservation not found');
    }
    await reservation.deleteOne();
    return reservation;
};

/**
 * Update field by ID
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Field>}
 */
const updateFieldById = async (id, updateBody) => {
    const field = await Field.findById(id);
    if (!field) {
        throw new Error('Field not found');
    }
    Object.assign(field, updateBody);
    await field.save();
    return field;
};

module.exports = {
    getFields,
    createReservation,
    queryReservations,
    getAllReservations,
    getReservationById,
    updateReservationById,
    deleteReservationById,
    updateFieldById,
};
