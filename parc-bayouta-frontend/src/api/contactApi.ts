const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ContactMessage {
    id: string;
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
    status: 'new' | 'processed' | 'archived';
    createdAt: string;
}

export const getMessages = async (): Promise<ContactMessage[]> => {
    const response = await fetch(`${API_URL}/api/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
};

export const submitMessage = async (message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<ContactMessage> => {
    const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to submit message');
    return response.json();
};

export const updateMessageStatus = async (id: string, status: 'processed' | 'archived'): Promise<ContactMessage> => {
    const response = await fetch(`${API_URL}/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update message status');
    return response.json();
};

export const deleteMessage = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/messages/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete message');
};
