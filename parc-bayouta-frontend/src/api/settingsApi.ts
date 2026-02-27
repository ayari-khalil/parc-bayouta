const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ParkInfo {
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    description: string;
}

export interface OpeningHours {
    weekdays: string;
    friday: string;
    weekend: string;
}

export interface SocialLinks {
    facebook: string;
    instagram: string;
    tiktok: string;
}

export interface HomeContent {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
}

export interface Settings {
    parkInfo: ParkInfo;
    openingHours: OpeningHours;
    socialLinks: SocialLinks;
    homeContent: HomeContent;
}

/**
 * Get all settings
 */
export const getSettings = async (): Promise<Settings> => {
    const response = await fetch(`${API_URL}/api/settings`);
    if (!response.ok) {
        throw new Error('Failed to fetch settings');
    }
    return response.json();
};

/**
 * Update settings
 */
export const updateSettings = async (data: Partial<Settings>): Promise<Settings> => {
    const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update settings');
    }
    return response.json();
};
