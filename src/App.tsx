
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute'

// Public Pages
import Index from '@/pages/Index'
import { AuthPage } from '@/components/auth/AuthPage'
import About from '@/pages/About'
import Services from '@/pages/Services'
import Pricing from '@/pages/Pricing'
import Contact from '@/pages/Contact'

// Client Pages
import ClientDashboard from '@/pages/ClientDashboard'
import PlanManagement from '@/pages/PlanManagement'
import MyServices from '@/pages/MyServices'
import ServiceRequests from '@/pages/ServiceRequests'
import Contacts from '@/pages/Contacts'
import Help from '@/pages/Help'
import Analytics from '@/pages/Analytics'
import BulkSMS from '@/pages/BulkSMS'
import WhatsAppCampaigns from '@/pages/WhatsAppCampaigns'
import EmailCampaigns from '@/pages/EmailCampaigns'
import ServiceDesk from '@/pages/ServiceDesk'
import USSDServices from '@/pages/USSDServices'
import MpesaServices from '@/pages/MpesaServices'
import Shortcode from '@/pages/Shortcode'

// Admin Routes
import { AdminRoutes } from '@/routes/AdminRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected Client Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <ClientDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/plan-management" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <PlanManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/my-services" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <MyServices />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/service-requests" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <ServiceRequests />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <Contacts />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <Analytics />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <Help />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/bulk-sms" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <BulkSMS />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/whatsapp" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <WhatsAppCampaigns />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/email" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <EmailCampaigns />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/service-desk" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <ServiceDesk />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/ussd" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <USSDServices />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/shortcode" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <Shortcode />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/mpesa" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['user']}>
                  <MpesaServices />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminRoutes />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
