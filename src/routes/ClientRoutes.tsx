import React from "react";
import { Routes, Route } from "react-router-dom";
import { RoleBasedRoute } from "../components/auth/RoleBasedRoute";
import ClientDashboard from "../pages/ClientDashboard";
import PlanManagement from "../pages/PlanManagement";
import Help from "../pages/Help";
import Analytics from "../pages/Analytics";
import BulkSMS from "../pages/BulkSMS";
import Contacts from "../pages/Contacts";
import WhatsAppCampaigns from "../pages/WhatsAppCampaigns";
import EmailCampaigns from "../pages/EmailCampaigns";
import CampaignAnalytics from "../pages/CampaignAnalytics";
import ProfileSettings from "../pages/ProfileSettings";
import BillingDashboard from "../pages/BillingDashboard";
import SurveyBuilder from "../pages/SurveyBuilder";
import Surveys from "../pages/Surveys";
import ServiceDesk from "../pages/ServiceDesk";
import USSDServices from "../pages/USSDServices";
import MpesaServices from "../pages/MpesaServices";
import ServiceRequests from "../pages/ServiceRequests";
import MyServices from "../pages/MyServices";
import Shortcode from "../pages/Shortcode";
import DataHubPage from "../pages/DataHub";

export function ClientRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/plan-management" element={<PlanManagement />} />
      <Route path="/help" element={<Help />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/bulk-sms" element={<BulkSMS />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/whatsapp" element={<WhatsAppCampaigns />} />
      <Route path="/email" element={<EmailCampaigns />} />
      <Route path="/campaign-analytics" element={<CampaignAnalytics />} />
      <Route path="/surveys" element={<Surveys />} />
      <Route path="/survey-builder" element={<SurveyBuilder />} />
      <Route path="/service-desk" element={<ServiceDesk />} />
      <Route path="/my-services" element={<MyServices />} />
      <Route path="/ussd" element={<USSDServices />} />
      <Route path="/mpesa" element={<MpesaServices />} />
      <Route path="/billing" element={<BillingDashboard />} />
      <Route path="/profile" element={<ProfileSettings />} />
      <Route path="/service-requests" element={<ServiceRequests />} />
      <Route path="/shortcode" element={<Shortcode />} />
      <Route path="/data-hub" element={<DataHubPage />} />
    </Routes>
  );
}
