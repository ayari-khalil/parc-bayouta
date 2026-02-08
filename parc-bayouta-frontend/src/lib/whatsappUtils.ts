/**
 * Utility to send a pre-filled WhatsApp message to the admin.
 * Uses the official wa.me link format.
 */
export const sendWhatsAppMessage = (details: {
    type: 'Mini-Foot' | 'Salle des Fêtes' | 'Événement';
    title?: string;
    field?: string;
    name: string;
    phone: string;
    date: string;
    time?: string;
    guests?: string | number;
    message?: string;
    attendees?: number;
}) => {
    const adminPhone = "21656251619";

    let text = `*Nouvelle réservation ${details.type}*\n\n`;

    if (details.field) text += `*Terrain:* ${details.field}\n`;
    if (details.title) text += `*Événement:* ${details.title}\n`;

    text += `*Nom:* ${details.name}\n`;
    text += `*Tél:* ${details.phone}\n`;
    text += `*Date:* ${details.date}\n`;

    if (details.time) text += `*Heure:* ${details.time}\n`;
    if (details.guests) text += `*Invités:* ${details.guests}\n`;
    if (details.attendees) text += `*Nombre de personnes:* ${details.attendees}\n`;
    if (details.message) text += `*Message:* ${details.message}\n`;

    const encodedMessage = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

    // Open in a new tab
    window.open(whatsappUrl, '_blank');
};
