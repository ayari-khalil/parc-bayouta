import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CafeOrder from '../CafeOrder';
import * as menuApi from '@/api/menuApi';

// Mock the APIs
vi.mock('@/api/menuApi');
vi.mock('@/api/orderApi');
vi.mock('@/api/notificationApi');
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const mockCategories = [
    { id: '1', name: 'Coffee', icon: 'Coffee', order: 1, isActive: true },
    { id: '2', name: 'Snacks', icon: 'Cake', order: 2, isActive: true },
];

const mockItems = [
    { id: '101', name: 'Espresso', price: 3, category: '1', isActive: true, image: '', description: 'Strong coffee' },
    { id: '102', name: 'Croissant', price: 2, category: '2', isActive: true, image: '', description: 'Flaky pastry' },
];

describe('CafeOrder Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (menuApi.getCategories as any).mockResolvedValue(mockCategories);
        (menuApi.getPublicMenuItems as any).mockResolvedValue(mockItems);
    });

    const renderComponent = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CafeOrder />
                </MemoryRouter>
            </QueryClientProvider>
        );

    it('renders categories and items', async () => {
        renderComponent();

        expect(await screen.findByText('Coffee')).toBeInTheDocument();
        expect(screen.getByText('Snacks')).toBeInTheDocument();
        expect(screen.getByText('Espresso')).toBeInTheDocument();
        expect(screen.getByText('Croissant')).toBeInTheDocument();
    });

    it('filters items by category', async () => {
        renderComponent();

        await screen.findByText('Espresso');

        // Click on Snacks category
        const snacksBtn = screen.getByText('Snacks');
        fireEvent.click(snacksBtn);

        // Espresso should be hidden, Croissant should remain
        expect(screen.queryByText('Espresso')).not.toBeInTheDocument();
        expect(screen.getByText('Croissant')).toBeInTheDocument();
    });

    it('adds items to cart and updates total', async () => {
        renderComponent();

        const addButtons = await screen.findAllByText('Ajouter');
        fireEvent.click(addButtons[0]); // Add Espresso

        // Open cart
        const viewCartBtn = screen.getByText(/Voir mon panier/i);
        fireEvent.click(viewCartBtn);

        // Check cart total in sheet
        expect(await screen.findByText(/Mon Panier \(3 DT\)/i)).toBeInTheDocument();

        // Add another Espresso from the menu (not the cart update btn for simplicity)
        fireEvent.click(addButtons[0]);
        expect(screen.getByText(/Mon Panier \(6 DT\)/i)).toBeInTheDocument();
    });
});
