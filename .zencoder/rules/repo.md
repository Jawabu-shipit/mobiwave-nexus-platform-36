---
description: Repository Information Overview
alwaysApply: true
---

# Mobiwave Nexus Platform Information

## Repository Summary
Mobiwave Nexus is a comprehensive communications platform built with React, TypeScript, and Supabase. It provides SMS, USSD, and mobile payment services with a focus on analytics, service management, and API integrations.

## Repository Structure
- **src/**: Frontend React application with TypeScript
- **supabase/**: Backend serverless functions and database migrations
- **public/**: Static assets for the frontend
- **k8s/**: Kubernetes deployment configurations
- **scripts/**: Utility scripts for deployment and testing

### Main Repository Components
- **Frontend Application**: React-based dashboard for service management
- **Supabase Functions**: Serverless backend for API integrations
- **Database Migrations**: SQL scripts for database schema management
- **Docker Configuration**: Containerization setup for deployment

## Projects

### Frontend Application
**Configuration File**: package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.5.3
**Build System**: Vite 5.4.1
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router 6.26.2
- Supabase JS 2.51.0
- TanStack React Query 5.56.2
- Shadcn UI (via Radix UI components)
- Tailwind CSS 3.4.11
- Zod 3.23.8
- crypto-js 4.2.0

**Development Dependencies**:
- ESLint 9.9.0
- Vite 5.4.1
- TypeScript 5.5.3

#### Build & Installation
```bash
npm install
npm run dev    # Development
npm run build  # Production build
npm run preview # Preview production build
```

#### Docker
**Dockerfile**: Multi-stage build using Node.js 18 Alpine and Nginx
**Image**: Frontend served via Nginx on port 80
**Configuration**: Docker Compose setup with PostgreSQL, Redis, RabbitMQ, and monitoring services

### Supabase Functions
**Configuration File**: supabase/functions/*/index.ts

#### Language & Runtime
**Language**: TypeScript (Deno)
**Version**: Deno standard library 0.168.0
**Build System**: Supabase Edge Functions

#### Key Functions
- **mspace-sms**: SMS sending service
- **mspace-balance**: Balance checking service
- **mspace-accounts**: Manages user accounts and reseller clients
- **mspace-credentials**: Handles API credential management
- **mpesa-payment**: Mobile payment processing
- **analytics-processor**: Usage data collection
- **data-hub-api**: Data management and processing
- **encrypt-data**: Encryption utilities for sensitive data

#### API Integration
The platform integrates with the Mspace SMS API:
- **Endpoints**: 
  - SMS Sending: `https://api.mspace.co.ke/smsapi/v2/sendtext`
  - Reseller Clients: `https://api.mspace.co.ke/smsapi/v2/resellerclients`
  - Balance Check: `https://api.mspace.co.ke/smsapi/v2/balance`
  - Sub Accounts: `https://api.mspace.co.ke/smsapi/v2/subusers`
  - Top-up Sub Account: `https://api.mspace.co.ke/smsapi/v2/subacctopup`
  - Top-up Reseller Client: `https://api.mspace.co.ke/smsapi/v2/resellerclienttopup`
- **Authentication**: API Key in headers
- **Request Methods**: Primarily POST with JSON payloads

#### Security Features
- **API Key Encryption**: Uses AES-GCM encryption for storing API keys
- **Error Handling**: Implements retry mechanisms with exponential backoff
- **Structured Error Responses**: Categorized error types for better client handling
- **Request Tracking**: Unique request IDs for tracing and debugging

#### Deployment
**Deploy Scripts**:
```bash
# Deploy all Supabase functions
./deploy.ps1

# Deploy specific function groups
./deploy-data-hub-functions.ps1
./deploy-user-settings.ps1
./deploy-missing-functions.ps1
```

### Database Layer
**Configuration File**: supabase/migrations/*.sql

#### Specification & Tools
**Type**: PostgreSQL database with Supabase extensions
**Version**: PostgreSQL 15 (from docker-compose.yml)
**Required Tools**: Supabase CLI, PostgreSQL client

#### Key Resources
**Main Files**:
- init-db.sql: Initial database setup
- Multiple migration files for schema evolution
- Database triggers for user creation and service activation

#### Key Tables
- api_credentials: Stores encrypted API keys and credentials
- message_history: Tracks sent messages
- campaigns: Manages messaging campaigns
- user_service_subscriptions: Tracks service activations
- import_jobs: Manages data import operations

### Infrastructure Configuration
**Configuration File**: docker-compose.yml, k8s/*.yaml

#### Specification & Tools
**Type**: Docker Compose and Kubernetes manifests
**Required Tools**: Docker, Docker Compose, kubectl

#### Key Resources
- **docker-compose.yml**: Multi-service setup with PostgreSQL, Redis, RabbitMQ
- **k8s/frontend-deployment.yaml**: Kubernetes deployment configuration
- **prometheus.yml**: Monitoring configuration

#### Monitoring
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Visualization dashboard (port 3001)
- **Health Checks**: Configured for all services