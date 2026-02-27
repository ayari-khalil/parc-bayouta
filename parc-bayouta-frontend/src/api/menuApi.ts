const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============== CATEGORY API ==============

export interface MenuCategory {
    id: string;
    name: string;
    icon: string;
    order: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuItem {
    id: string;
    category: string | MenuCategory;
    name: string;
    price: number;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Get all categories
 */
export const getCategories = async (): Promise<MenuCategory[]> => {
    const response = await fetch(`${API_URL}/api/menu/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
};

/**
 * Create a new category
 */
export const createCategory = async (data: Partial<MenuCategory>): Promise<MenuCategory> => {
    const response = await fetch(`${API_URL}/api/menu/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create category');
    }
    return response.json();
};

/**
 * Update a category
 */
export const updateCategory = async (id: string, data: Partial<MenuCategory>): Promise<MenuCategory> => {
    const response = await fetch(`${API_URL}/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update category');
    }
    return response.json();
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/menu/categories/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete category');
    }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (orders: { id: string; order: number }[]): Promise<MenuCategory[]> => {
    const response = await fetch(`${API_URL}/api/menu/categories/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
    });
    if (!response.ok) {
        throw new Error('Failed to reorder categories');
    }
    return response.json();
};

// ============== MENU ITEM API ==============

/**
 * Get all menu items (admin view)
 */
export const getMenuItems = async (filters?: { categoryId?: string; isActive?: boolean }): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const response = await fetch(`${API_URL}/api/menu/items?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch menu items');
    }
    return response.json();
};

/**
 * Get public menu items (client view - only active items)
 */
export const getPublicMenuItems = async (categoryId?: string): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);

    const response = await fetch(`${API_URL}/api/menu/items/public?${params}`);
    if (!response.ok) {
        throw new Error('Failed to fetch public menu items');
    }
    return response.json();
};

/**
 * Create a new menu item
 */
export const createMenuItem = async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await fetch(`${API_URL}/api/menu/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to create menu item');
    }
    return response.json();
};

/**
 * Update a menu item
 */
export const updateMenuItem = async (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await fetch(`${API_URL}/api/menu/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update menu item');
    }
    return response.json();
};

/**
 * Toggle menu item active status
 */
export const toggleMenuItem = async (id: string): Promise<MenuItem> => {
    const response = await fetch(`${API_URL}/api/menu/items/${id}/toggle`, {
        method: 'PATCH',
    });
    if (!response.ok) {
        throw new Error('Failed to toggle menu item');
    }
    return response.json();
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/menu/items/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete menu item');
    }
};

/**
 * Upload an image
 */
export const uploadImage = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    return response.json();
};
