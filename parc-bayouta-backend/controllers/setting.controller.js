const Setting = require('../models/setting.model');

const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await Setting.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting(req.body);
        } else {
            // Prevent park name modification if needed, but here we just update
            // Based on user request: "nom non modifiable"
            if (req.body.parkInfo && req.body.parkInfo.name) {
                req.body.parkInfo.name = settings.parkInfo.name;
            }
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
