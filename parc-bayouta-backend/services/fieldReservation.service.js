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
    return FieldReservation.create(reservationBody);
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

module.exports = {
    getFields,
    createReservation,
    queryReservations,
    getAllReservations,
    getReservationById,
    updateReservationById,
    deleteReservationById,
};
