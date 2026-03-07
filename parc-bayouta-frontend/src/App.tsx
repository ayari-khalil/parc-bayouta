import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { recordVisit } from "@/api/analyticsApi";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Lazy-loaded Public Pages
const Home = lazy(() => import("./pages/Home"));
const Fields = lazy(() => import("./pages/Fields"));
const EventHall = lazy(() => import("./pages/EventHall"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const CafeRestaurant = lazy(() => import("./pages/CafeRestaurant"));
const CafeOrder = lazy(() => import("./pages/CafeOrder"));
const Events = lazy(() => import("./pages/Events"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminFields = lazy(() => import("./pages/admin/AdminFields"));
const AdminEventHall = lazy(() => import("./pages/admin/AdminEventHall"));
const AdminMenu = lazy(() => import("./pages/admin/AdminMenu"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminEventReservations = lazy(() => import("./pages/admin/AdminEventReservations"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
  </div>
);

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
          <BrowserRouter>
            <NotificationProvider>
              <Toaster />
              <Sonner position="top-center" />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/fields" element={<Fields />} />
                  <Route path="/event-hall" element={<EventHall />} />
                  <Route path="/cafe-restaurant" element={<CafeRestaurant />} />
                  <Route path="/cafe-order" element={<CafeOrder />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:slug" element={<EventDetails />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/fields" element={<ProtectedRoute><AdminFields /></ProtectedRoute>} />
                  <Route path="/admin/event-hall" element={<ProtectedRoute><AdminEventHall /></ProtectedRoute>} />
                  <Route path="/admin/menu" element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                  <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
                  <Route path="/admin/event-reservations" element={<ProtectedRoute><AdminEventReservations /></ProtectedRoute>} />
                  <Route path="/admin/reservations" element={<ProtectedRoute><AdminReservations /></ProtectedRoute>} />
                  <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
