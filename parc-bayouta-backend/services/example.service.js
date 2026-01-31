const { Example } = require('../models');

/**
 * Create a example
 * @param {Object} exampleBody
 * @returns {Promise<Example>}
 */
const createExample = async (exampleBody) => {
    const example = await Example.create(exampleBody);
    return example;
};

module.exports = {
    createExample,
};
