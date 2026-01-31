const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const menuCategorySchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        icon: { type: String }, // Icon name for frontend
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

menuCategorySchema.plugin(toJSON);
menuCategorySchema.plugin(paginate);

const menuItemSchema = mongoose.Schema(
    {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        image: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

menuItemSchema.plugin(toJSON);
menuItemSchema.plugin(paginate);

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { MenuCategory, MenuItem };
