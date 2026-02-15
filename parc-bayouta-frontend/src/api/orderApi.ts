const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id?: string;
    items: OrderItem[];
    tableNumber: string;
    totalAmount: number;
    status: 'pending' | 'preparing' | 'completed' | 'cancelled';
    createdAt?: string;
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
 * Create a new order
 */
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    });
    return handleResponse(response);
};

/**
 * Get all orders
 */
export const getOrders = async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/api/orders`);
    return handleResponse(response);
};
