import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import * as orderApi from '@/api/orderApi';
import { reservationApi } from '@/lib/api/reservation';
import { eventApi, messageApi } from '@/api/dashboardApi';
import * as notificationApi from '@/api/notificationApi';

interface AdminStats {
    pendingOrders: number;
    pendingHallRes: number;
    pendingFieldRes: number;
    pendingEventRes: number;
    newMessages: number;
    unreadNotifications: number;
}

interface NotificationContextType {
    unreadCount: number;
    adminStats: AdminStats;
    addNotification: () => void;
    resetNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');
    const [unreadCount, setUnreadCount] = useState<number>(() => {
        const saved = localStorage.getItem('unreadNotifications');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [adminStats, setAdminStats] = useState<AdminStats>({
        pendingOrders: 0,
        pendingHallRes: 0,
        pendingFieldRes: 0,
        pendingEventRes: 0,
        newMessages: 0,
        unreadNotifications: 0
    });

    const lastCounts = useRef<AdminStats>({ ...adminStats });
    const notificationSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        notificationSound.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        localStorage.setItem('unreadNotifications', unreadCount.toString());
    }, [unreadCount]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'unreadNotifications') {
                setUnreadCount(e.newValue ? parseInt(e.newValue, 10) : 0);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const playNotificationSound = () => {
        if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
            notificationSound.current.play().catch((error) => console.log("Audio play failed:", error));
        }
    };

    const fetchAdminStats = async () => {
        if (!user || user.role !== 'admin' || !isAdminPath) return;

        try {
            const [orders, hallRes, fieldRes, eventRes, messages, notifications] = await Promise.all([
                orderApi.getOrders(),
                reservationApi.getAllHallReservations(),
                reservationApi.getAllFieldReservations(),
                eventApi.getReservations(),
                messageApi.getMessages(),
                notificationApi.getNotifications()
            ]);

            const newStats: AdminStats = {
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                pendingHallRes: hallRes.filter(r => r.status === 'pending').length,
                pendingFieldRes: fieldRes.filter(r => r.status === 'pending').length,
                pendingEventRes: eventRes.filter(r => r.status === 'pending').length,
                newMessages: messages.filter(m => m.status === 'new').length,
                unreadNotifications: notifications.filter(n => !n.isRead).length
            };

            // Check for increases to trigger sound/toast
            const hasIncrease =
                newStats.pendingOrders > lastCounts.current.pendingOrders ||
                newStats.pendingHallRes > lastCounts.current.pendingHallRes ||
                newStats.pendingFieldRes > lastCounts.current.pendingFieldRes ||
                newStats.pendingEventRes > lastCounts.current.pendingEventRes ||
                newStats.newMessages > lastCounts.current.newMessages ||
                newStats.unreadNotifications > lastCounts.current.unreadNotifications;

            if (hasIncrease && lastCounts.current.pendingOrders + lastCounts.current.pendingHallRes + lastCounts.current.pendingFieldRes > 0) {
                playNotificationSound();

                let title = "Nouvelle alerte Admin";
                let description = "Une nouvelle demande ou commande a été reçue.";

                if (newStats.pendingOrders > lastCounts.current.pendingOrders) {
                    title = "Nouvelle Commande !";
                    description = "Une nouvelle commande restaurant a été passée.";
                } else if (newStats.pendingHallRes > lastCounts.current.pendingHallRes || newStats.pendingFieldRes > lastCounts.current.pendingFieldRes) {
                    title = "Nouvelle Réservation !";
                    description = "Une nouvelle demande de réservation a été reçue.";
                }

                toast(title, {
                    description,
                    position: "top-center",
                    duration: 5000,
                });
            }

            setAdminStats(newStats);
            lastCounts.current = newStats;

            // Sync unreadCount with total pending items for the sidebar badge
            const totalPending = newStats.pendingOrders + newStats.pendingHallRes + newStats.pendingFieldRes + newStats.pendingEventRes;
            setUnreadCount(totalPending);

        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin' && isAdminPath) {
            fetchAdminStats();
            const interval = setInterval(fetchAdminStats, 10000); // Poll every 10s
            return () => clearInterval(interval);
        } else {
            setAdminStats({
                pendingOrders: 0,
                pendingHallRes: 0,
                pendingFieldRes: 0,
                pendingEventRes: 0,
                newMessages: 0,
                unreadNotifications: 0
            });
        }
    }, [user]);

    const addNotification = () => {
        // Only update unread count for UI if needed
        setUnreadCount((prev) => prev + 1);

        // ONLY play sound and show toast if the user is an admin AND on an admin path
        if (user && user.role === 'admin' && isAdminPath) {
            playNotificationSound();
            toast("Nouvelle Réservation !", {
                description: "Une nouvelle réservation a été effectuée.",
                position: "top-center",
                duration: 5000,
            });
        }
    };

    const resetNotifications = () => {
        // We don't necessarily want to set to 0 if there are still pending orders/res
        // but this method is used to "clear" the alert state if needed.
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, adminStats, addNotification, resetNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
