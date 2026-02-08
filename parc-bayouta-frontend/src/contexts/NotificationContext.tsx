import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";

interface NotificationContextType {
    unreadCount: number;
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
    const [unreadCount, setUnreadCount] = useState<number>(() => {
        const saved = localStorage.getItem('unreadNotifications');
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
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
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch((error) => console.log("Audio play failed:", error));
        } catch (error) {
            console.error("Error playing notification sound:", error);
        }
    };

    const addNotification = () => {
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        // Show toast at the bottom
        toast("Nouvelle Réservation !", {
            description: "Une nouvelle réservation a été effectuée.",
            position: "bottom-right",
            duration: 5000,
            action: {
                label: "Voir",
                onClick: () => window.location.href = "/admin/reservations"
            },
        });
    };

    const resetNotifications = () => {
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, addNotification, resetNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
