const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Record a visit for today
 */
export const recordVisit = async (): Promise<{ success: boolean; count: number }> => {
    const response = await fetch(`${API_URL}/api/analytics/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error('Failed to record visit');
    }
    return response.json();
};

/**
 * Get today's visit count
 */
export const getTodayVisits = async (): Promise<{ success: boolean; count: number }> => {
    const response = await fetch(`${API_URL}/api/analytics/today`);
    if (!response.ok) {
        throw new Error('Failed to fetch today\'s visits');
    }
    return response.json();
};
