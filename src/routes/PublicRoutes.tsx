
import React from 'react';
import { Route } from 'react-router-dom';
import Index from '../pages/Index';
import { AuthPage } from '../components/auth/AuthPage';
import About from '../pages/About';
import Services from '../pages/Services';
import Pricing from '../pages/Pricing';
import Contact from '../pages/Contact';

export const publicRoutes = [
  <Route key="home" path="/" element={<Index />} />,
  <Route key="auth" path="/auth" element={<AuthPage />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="services" path="/services" element={<Services />} />,
  <Route key="pricing" path="/pricing" element={<Pricing />} />,
  <Route key="contact" path="/contact" element={<Contact />} />
];
