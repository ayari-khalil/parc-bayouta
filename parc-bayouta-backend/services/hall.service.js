const { Hall } = require('../models');

/**
 * Get all halls
 * @returns {Promise<Array<Hall>>}
 */
const getAllHalls = async () => {
    return Hall.find({ status: 'active' });
};

/**
 * Get hall by ID
 * @param {string} id
 * @returns {Promise<Hall>}
 */
const getHallById = async (id) => {
    return Hall.findById(id);
};

module.exports = {
    getAllHalls,
    getHallById,
};
