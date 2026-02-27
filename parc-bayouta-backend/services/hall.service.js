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

/**
 * Update hall by ID
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Hall>}
 */
const updateHallById = async (id, updateBody) => {
    const hall = await getHallById(id);
    if (!hall) {
        throw new Error('Hall not found');
    }
    Object.assign(hall, updateBody);
    await hall.save();
    return hall;
};

module.exports = {
    getAllHalls,
    getHallById,
    updateHallById,
};
