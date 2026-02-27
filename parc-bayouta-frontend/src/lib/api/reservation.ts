const API_URL = 'http://localhost:5000/api';

export interface Hall {
    id: string;
    _id?: string;
    name: string;
    images: string[];
    status: 'active' | 'maintenance';
}

export interface HallReservation {
    id?: string;
    _id?: string;
    hall: string | Hall;
    date: string;
    customerName: string;
    customerPhone: string;
    eventType: string;
    guestCount: number;
    message?: string;
    status: 'pending' | 'confirmed' | 'canceled' | 'blocked';
    isRecurring?: boolean;
    recurringGroupId?: string;
    createdAt?: string;
}

export interface FieldReservation {
    id?: string;
    _id?: string;
    field: number | string | { _id: string, name: string };
    fieldId?: number; // for backward compatibility/mapping
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    status: 'pending' | 'confirmed' | 'canceled' | 'blocked';
    isRecurring?: boolean;
    recurringGroupId?: string;
    createdAt?: string;
}

export const reservationApi = {
    // Hall Reservations
    createHallReservation: async (reservation: Omit<HallReservation, 'status'> & { status?: 'pending' | 'confirmed' | 'blocked' }): Promise<HallReservation> => {
        const response = await fetch(`${API_URL}/hall-reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...reservation, status: reservation.status || 'pending' }),
        });
        if (!response.ok) {
            throw new Error('Failed to create reservation');
        }
        return response.json();
    },

    getAllHallReservations: async (hallId?: string): Promise<HallReservation[]> => {
        const url = hallId ? `${API_URL}/hall-reservations?hall=${hallId}` : `${API_URL}/hall-reservations`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch reservations');
        }
        return response.json();
    },

    getHalls: async (): Promise<Hall[]> => {
        const response = await fetch(`${API_URL}/hall-reservations/halls`);
        if (!response.ok) {
            throw new Error('Failed to fetch halls');
        }
        return response.json();
    },

    updateHallReservationStatus: async (id: string, status: 'confirmed' | 'canceled'): Promise<HallReservation> => {
        const response = await fetch(`${API_URL}/hall-reservations/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to update reservation');
        }
        return response.json();
    },

    deleteHallReservation: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/hall-reservations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete reservation');
        }
    },

    updateHall: async (id: string, data: Partial<Hall>): Promise<Hall> => {
        const response = await fetch(`${API_URL}/hall-reservations/halls/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update hall');
        }
        return response.json();
    },

    // Field Reservations
    createFieldReservation: async (reservation: Omit<FieldReservation, 'status'> & { status?: 'pending' | 'confirmed' | 'blocked' }): Promise<FieldReservation> => {
        const response = await fetch(`${API_URL}/field-reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...reservation, status: reservation.status || 'pending' }),
        });
        if (!response.ok) {
            throw new Error('Failed to create field reservation');
        }
        return response.json();
    },

    getAllFieldReservations: async (): Promise<FieldReservation[]> => {
        const response = await fetch(`${API_URL}/field-reservations`);
        if (!response.ok) {
            throw new Error('Failed to fetch field reservations');
        }
        return response.json();
    },

    updateFieldReservationStatus: async (id: string, status: 'confirmed' | 'canceled'): Promise<FieldReservation> => {
        const response = await fetch(`${API_URL}/field-reservations/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            throw new Error('Failed to update field reservation');
        }
        return response.json();
    },

    deleteFieldReservation: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/field-reservations/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete field reservation');
        }
    },

    getFields: async (): Promise<{ id: string, name: string, images: string[] }[]> => {
        const response = await fetch(`${API_URL}/field-reservations/fields`);
        if (!response.ok) {
            throw new Error('Failed to fetch fields');
        }
        return response.json();
    },

    updateField: async (id: string, data: { images?: string[], name?: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/field-reservations/fields/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update field');
        }
        return response.json();
    },
};
