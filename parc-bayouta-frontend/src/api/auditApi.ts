const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuditLog {
    id: string;
    _id?: string;
    admin: string;
    action: string;
    category: string;
    details: string;
    createdAt: string;
}

export const auditApi = {
    getLogs: async (): Promise<AuditLog[]> => {
        const response = await fetch(`${API_URL}/api/audit`);
        if (!response.ok) throw new Error('Failed to fetch audit logs');
        return response.json();
    },
    recordLog: async (log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> => {
        const response = await fetch(`${API_URL}/api/audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
        });
        if (!response.ok) throw new Error('Failed to record audit log');
        return response.json();
    }
};
