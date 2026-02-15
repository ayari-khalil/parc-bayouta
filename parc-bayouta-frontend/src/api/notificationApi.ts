const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Notification {
    id: string;
    type: 'order' | 'waiter_call' | 'bill_request';
    tableNumber: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

/**
 * Handle API responses
 * @param response Fetch response object
 * @returns Parsed JSON or throws an error
 */
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
};

/**
 * Call a waiter
 */
export const callWaiter = async (tableNumber: string): Promise<Notification> => {
    const response = await fetch(`${API_URL}/api/notifications/call-waiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber }),
    });
    return handleResponse(response);
};

/**
 * Request the bill
 */
export const requestBill = async (tableNumber: string): Promise<Notification> => {
    const response = await fetch(`${API_URL}/api/notifications/request-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber }),
    });
    return handleResponse(response);
};

/**
 * Get all notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await fetch(`${API_URL}/api/notifications`);
    return handleResponse(response);
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string): Promise<Notification> => {
    const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
    });
    return handleResponse(response);
};
