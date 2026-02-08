import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import Fields from "./pages/Fields";
import EventHall from "./pages/EventHall";
import CafeRestaurant from "./pages/CafeRestaurant";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFields from "./pages/admin/AdminFields";
import AdminEventHall from "./pages/admin/AdminEventHall";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventReservations from "./pages/admin/AdminEventReservations";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";

import { recordVisit } from "@/api/analyticsApi";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Record visit on page load - refined with a check to prevent loops/multiple triggers
    const hasVisited = sessionStorage.getItem('visited_today');
    const isAdminPath = window.location.pathname.startsWith('/admin');

    if (!hasVisited && !isAdminPath) {
      recordVisit()
        .then(() => sessionStorage.setItem('visited_today', 'true'))
        .catch(err => console.error("Failed to record visit:", err));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/fields" element={<Fields />} />
                <Route path="/event-hall" element={<EventHall />} />
                <Route path="/cafe-restaurant" element={<CafeRestaurant />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetails />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/fields" element={<ProtectedRoute><AdminFields /></ProtectedRoute>} />
                <Route path="/admin/event-hall" element={<ProtectedRoute><AdminEventHall /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
                <Route path="/admin/event-reservations" element={<ProtectedRoute><AdminEventReservations /></ProtectedRoute>} />
                <Route path="/admin/reservations" element={<ProtectedRoute><AdminReservations /></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
