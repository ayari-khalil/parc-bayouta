const HallReservation = require('../models/hallReservation.model');

/**
 * Create a hall reservation
 * @param {Object} reservationBody
 * @returns {Promise<HallReservation>}
 */
const createReservation = async (reservationBody) => {
  return HallReservation.create(reservationBody);
};

/**
 * Query for hall reservations
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryReservations = async (filter, options) => {
  const reservations = await HallReservation.paginate(filter, { ...options, populate: 'hall' });
  return reservations;
};

/**
 * Get all hall reservations (non-paginated)
 * @param {Object} filter
 * @returns {Promise<Array<HallReservation>>}
 */
const getAllReservations = async (filter = {}) => {
  return HallReservation.find(filter).populate('hall').sort({ date: 1 });
};

/**
 * Get hall reservation by id
 * @param {ObjectId} id
 * @returns {Promise<HallReservation>}
 */
const getReservationById = async (id) => {
  return HallReservation.findById(id);
};

/**
 * Update hall reservation by id
 * @param {ObjectId} reservationId
 * @param {Object} updateBody
 * @returns {Promise<HallReservation>}
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
 * Delete hall reservation by id
 * @param {ObjectId} reservationId
 * @returns {Promise<HallReservation>}
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
  createReservation,
  queryReservations,
  getAllReservations,
  getReservationById,
  updateReservationById,
  deleteReservationById,
};
