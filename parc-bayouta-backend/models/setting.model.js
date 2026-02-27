const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  parkInfo: {
    name: { type: String, default: "Parc Bayouta" },
    address: { type: String, default: "Route de la Plage, El Alia, Skikda, Algérie" },
    phone: { type: String, default: "+213 555 123 456" },
    whatsapp: { type: String, default: "+213 555 123 456" },
    email: { type: String, default: "contact@parcbayouta.dz" },
    description: { type: String, default: "Votre destination familiale pour le sport, les loisirs et les événements à El Alia." }
  },
  openingHours: {
    weekdays: { type: String, default: "08:00 - 23:00" },
    friday: { type: String, default: "14:00 - 23:00" },
    weekend: { type: String, default: "08:00 - 00:00" }
  },
  socialLinks: {
    facebook: { type: String, default: "https://facebook.com/parcbayouta" },
    instagram: { type: String, default: "https://instagram.com/parcbayouta" },
    tiktok: { type: String, default: "" }
  },
  homeContent: {
    heroTitle: { type: String, default: "Parc Bayouta" },
    heroSubtitle: { type: String, default: "Sport, Détente et Événements à El Alia" },
    heroDescription: { type: String, default: "Découvrez un espace unique dédié aux loisirs en famille, au sport et aux célébrations. Terrains de mini-foot, salle des fêtes et café-restaurant vous attendent." }
  }
}, {
  timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
