# Mobiwave Nexus Platform Information

## Repository Summary
Mobiwave Nexus is a comprehensive communications platform built with React, TypeScript, and Supabase. It provides SMS, USSD, and mobile payment services with a focus on analytics, service management, and API integrations.

## Repository Structure
- **src/**: Frontend React application with TypeScript
- **supabase/**: Backend serverless functions and database migrations
- **public/**: Static assets for the frontend
- **k8s/**: Kubernetes deployment configurations
- **.github/**: CI/CD workflows

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
- Supabase JS 2.50.2
- TanStack React Query 5.56.2
- Shadcn UI (via Radix UI components)
- Tailwind CSS 3.4.11
- Zod 3.23.8

**Development Dependencies**:
- ESLint 9.9.0
- Vite 5.4.1
- TypeScript 5.5.3

#### Build & Installation
```bash
npm install
npm run dev    # Development
npm run build  # Production build
```

#### Docker
**Dockerfile**: Dockerfile
**Image**: Multi-stage build with Node 18 and Nginx
**Configuration**: Production-optimized with Nginx serving static files

### Supabase Functions
**Configuration File**: supabase/functions/*/index.ts

#### Language & Runtime
**Language**: TypeScript (Deno)
**Version**: Deno standard library 0.168.0
**Build System**: Supabase Edge Functions

#### Key Functions
- **mspace-sms**: SMS sending service
- **mpesa-payment**: Mobile payment processing
- **analytics-processor**: Usage data collection
- **webhook-processor**: External service integration
- **user-segmentation**: Customer targeting

#### Usage & Operations
```bash
supabase functions deploy mspace-sms
supabase functions serve --no-verify-jwt
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

#### Usage & Operations
```bash
supabase db reset
supabase migration new <migration-name>
```

### Infrastructure Configuration
**Configuration File**: docker-compose.yml, k8s/*.yaml

#### Specification & Tools
**Type**: Docker Compose and Kubernetes manifests
**Required Tools**: Docker, Docker Compose, kubectl

#### Key Resources
- **docker-compose.yml**: Multi-service setup with PostgreSQL, Redis, RabbitMQ
- **k8s/frontend-deployment.yaml**: Kubernetes deployment configuration
- **prometheus.yml**: Monitoring configuration

#### Usage & Operations
```bash
docker-compose up -d
kubectl apply -f k8s/
```