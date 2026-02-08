const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Event {
    id: string;
    _id?: string;
    slug: string;
    title: string;
    description: string;
    longDescription?: string;
    image?: string;
    date: string;
    time: string;
    endTime?: string;
    category: string;
    price: number;
    maxCapacity: number;
    currentReservations: number;
    location: string;
    isActive: boolean;
    isFeatured?: boolean;
    createdAt: string;
}

export interface EventReservation {
    id: string;
    _id?: string;
    event: string | Event;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    attendees: number;
    status: 'pending' | 'confirmed' | 'canceled';
    createdAt: string;
}

export interface ContactMessage {
    id: string;
    _id?: string;
    name: string;
    phone: string;
    subject: string;
    message: string;
    status: 'new' | 'processed' | 'archived';
    createdAt: string;
}

export const eventApi = {
    getEvents: async (): Promise<Event[]> => {
        const response = await fetch(`${API_URL}/api/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    },
    createEvent: async (event: Partial<Event>): Promise<Event> => {
        const response = await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    },
    updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        if (!response.ok) throw new Error('Failed to update event');
        return response.json();
    },
    deleteEvent: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event');
    },
    getReservations: async (): Promise<EventReservation[]> => {
        const response = await fetch(`${API_URL}/api/events/reservations`);
        if (!response.ok) throw new Error('Failed to fetch event reservations');
        return response.json();
    },
    createReservation: async (reservation: Partial<EventReservation>): Promise<EventReservation> => {
        const response = await fetch(`${API_URL}/api/events/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation),
        });
        if (!response.ok) throw new Error('Failed to create reservation');
        return response.json();
    },
    updateReservationStatus: async (id: string, status: string): Promise<EventReservation> => {
        const response = await fetch(`${API_URL}/api/events/reservations/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update reservation status');
        return response.json();
    },
    deleteReservation: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/api/events/reservations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete reservation');
    }
};

export const messageApi = {
    getMessages: async (): Promise<ContactMessage[]> => {
        const response = await fetch(`${API_URL}/api/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    }
};
