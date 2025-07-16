import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import ResponsiveViewport from "@/components/common/ResponsiveViewport";

// Public Pages
import Index from "@/pages/Index";
import { AuthPage } from "@/components/auth/AuthPage";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

// Client Pages - Using lazy loading for better performance
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
const PlanManagement = lazy(() => import("@/pages/PlanManagement"));
const MyServices = lazy(() => import("@/pages/MyServices"));
const ServiceRequests = lazy(() => import("@/pages/ServiceRequests"));
const Contacts = lazy(() => import("@/pages/Contacts"));
const Help = lazy(() => import("@/pages/Help"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const BulkSMS = lazy(() => import("@/pages/BulkSMS"));
const CampaignManagement = lazy(() => import("@/pages/CampaignManagement"));
const WhatsAppCampaigns = lazy(() => import("@/pages/WhatsAppCampaigns"));
const EmailCampaigns = lazy(() => import("@/pages/EmailCampaigns"));
const ServiceDesk = lazy(() => import("@/pages/ServiceDesk"));
const USSDServices = lazy(() => import("@/pages/USSDServices"));
const MpesaServices = lazy(() => import("@/pages/MpesaServices"));
const Shortcode = lazy(() => import("@/pages/Shortcode"));
const DataHub = lazy(() => import("@/pages/DataHub"));
const Settings = lazy(() => import("@/pages/Settings"));
const Billing = lazy(() => import("@/pages/Billing"));

// Admin Routes
import { AdminRoutes } from "@/routes/AdminRoutes";

// Loading component for Suspense
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          {/* Components that affect the entire app */}
          <ResponsiveViewport />
          <ScrollToTop />

          <Suspense fallback={<PageLoading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Client Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <ClientDashboard />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plan-management"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <PlanManagement />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-services"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <MyServices />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/service-requests"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <ServiceRequests />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Contacts />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Analytics />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Help />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bulk-sms"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <BulkSMS />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <CampaignManagement />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whatsapp"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <WhatsAppCampaigns />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <EmailCampaigns />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/service-desk"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <ServiceDesk />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ussd"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <USSDServices />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shortcode"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Shortcode />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-hub"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <DataHub />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mpesa"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <MpesaServices />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Settings />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["user"]}>
                      <Billing />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <RoleBasedRoute allowedRoles={["admin", "super_admin"]}>
                      <AdminRoutes />
                    </RoleBasedRoute>
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
