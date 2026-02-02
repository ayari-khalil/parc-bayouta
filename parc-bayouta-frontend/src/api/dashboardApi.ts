const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Event {
    id: string;
    _id?: string;
    slug: string;
    title: string;
    description: string;
    date: string;
    time: string;
    category: string;
    price: number;
    maxCapacity: number;
    currentReservations: number;
    isActive: boolean;
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
    }
};

export const messageApi = {
    getMessages: async (): Promise<ContactMessage[]> => {
        const response = await fetch(`${API_URL}/api/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    }
};
