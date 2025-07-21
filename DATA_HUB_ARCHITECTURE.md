# Data Hub Architecture Implementation

This document describes the implementation of the Data Hub and Campaign Management architecture as shown in the system diagram.

## Architecture Overview

```
graph TD
    subgraph "User Interface"
        UI_DataHub["Data Hub Module"]
        UI_Campaign["Campaign Module (GuidedBulkSMSFlow)"]
    end
    subgraph "Backend API"
        API_DataHub["Data Hub API"]
        API_Campaign["Campaign API"]
        API_Messaging["Messaging Service API"]
    end
    subgraph "Backend Services & Storage"
        DB["Database (Postgres w/ JSONB)"]
        FileStore["File Storage (Supabase Storage)"]
        JobQueue["Background Job Queue (Import Worker)"]
        Worker["Import Worker"]
    end
    UI_DataHub -- Manages --> API_DataHub
    UI_Campaign -- Creates --> API_Campaign
    API_DataHub -- CRUD --> DB
    API_Campaign -- Reads --> API_DataHub
    API_Campaign -- Sends to --> API_Messaging
    API_DataHub -- On Import --> JobQueue
    JobQueue -- Triggers --> Worker
    Worker -- Processes File & Updates --> DB
    Worker -- Reads from --> FileStore
```

## Implemented Components

### 1. User Interface Layer

#### Data Hub Module (`/src/pages/DataHub.tsx`)
- **Purpose**: Main interface for data model management and file imports
- **Features**:
  - Data model creation and management
  - File upload interface
  - Import job monitoring
  - Tabbed interface for different operations

#### Campaign Module (`/src/components/messaging/GuidedBulkSMSFlow.tsx`)
- **Purpose**: Guided workflow for creating SMS campaigns
- **Features**:
  - Step-by-step campaign creation
  - Data source selection (from data models)
  - Audience targeting with filtering
  - Message composition with preview
  - Campaign review and sending

### 2. Backend API Layer

#### Data Hub API (`/supabase/functions/data-hub-api/index.ts`)
- **Endpoints**:
  - `GET /data-hub-api/models` - List data models
  - `POST /data-hub-api/models` - Create data model
  - `GET /data-hub-api/models/{id}` - Get specific model
  - `PUT /data-hub-api/models/{id}` - Update model
  - `DELETE /data-hub-api/models/{id}` - Delete model
  - `GET /data-hub-api/records?model_id={id}` - Get records for model
  - `POST /data-hub-api/records` - Create record
  - `PUT /data-hub-api/records/{id}` - Update record
  - `DELETE /data-hub-api/records/{id}` - Delete record
  - `POST /data-hub-api/import` - Bulk import records

#### Campaign API (`/supabase/functions/campaign-api/index.ts`)
- **Endpoints**:
  - `GET /campaign-api/campaigns` - List campaigns
  - `POST /campaign-api/campaigns` - Create campaign
  - `GET /campaign-api/campaigns/{id}` - Get campaign details
  - `PUT /campaign-api/campaigns/{id}` - Update campaign
  - `DELETE /campaign-api/campaigns/{id}` - Delete campaign
  - `POST /campaign-api/campaigns/send` - Send campaign
  - `GET /campaign-api/recipients` - Get filtered recipients

#### Import Worker (`/supabase/functions/import-worker/index.ts`)
- **Purpose**: Background processing of file imports
- **Features**:
  - File download and parsing (CSV, JSON)
  - Data validation against model schema
  - Batch record insertion
  - Progress tracking
  - Error handling and reporting

### 3. Database Layer

#### Core Tables

**data_models**
```sql
CREATE TABLE "public"."data_models" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**records**
```sql
CREATE TABLE "public"."records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "model_id" UUID REFERENCES public.data_models(id) ON DELETE CASCADE NOT NULL,
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**import_jobs**
```sql
CREATE TABLE "public"."import_jobs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "model_id" UUID REFERENCES public.data_models(id) ON DELETE CASCADE NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_records" INTEGER,
    "processed_records" INTEGER DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**campaigns** (Enhanced)
```sql
-- Added columns for data model integration
ALTER TABLE "public"."campaigns" 
ADD COLUMN "data_model_id" UUID REFERENCES public.data_models(id) ON DELETE SET NULL,
ADD COLUMN "target_criteria" JSONB,
ADD COLUMN "content" TEXT,
ADD COLUMN "message" TEXT,
ADD COLUMN "subject" TEXT,
ADD COLUMN "metadata" JSONB;
```

### 4. File Storage

#### Supabase Storage Bucket
- **Bucket**: `imports`
- **Purpose**: Store uploaded CSV/JSON files for processing
- **Security**: Row-level security policies for user isolation
- **File Types**: CSV, JSON (up to 10MB)

## Key Features Implemented

### 1. Data Model Management
- Create custom data models with typed fields
- Support for text, number, date, email, and phone field types
- CRUD operations with real-time updates
- Field validation and schema enforcement

### 2. File Import System
- Drag-and-drop file upload interface
- Template generation for data models
- Background processing with progress tracking
- Error handling and validation
- Support for CSV and JSON formats

### 3. Campaign Integration
- Data model selection for recipient targeting
- Advanced filtering and audience segmentation
- Real-time recipient preview
- Message composition with character counting
- Campaign scheduling and sending

### 4. Analytics and Monitoring
- Import job status tracking
- Campaign performance metrics
- Delivery rate analytics
- Cost tracking and reporting

## Frontend Components

### Hooks
- `useDataModels` - Data model CRUD operations
- `useEnhancedDataHub` - Records and import management
- `useCampaigns` - Campaign management
- `useEnhancedDataHub` - File upload and processing

### UI Components
- `DataModelList` - Display and manage data models
- `ModelBuilder` - Create/edit data models
- `FileUpload` - File upload interface
- `ImportJobsMonitor` - Track import progress
- `GuidedBulkSMSFlow` - Step-by-step campaign creation
- `CampaignList` - Campaign management interface
- `CampaignAnalytics` - Performance dashboards

## API Integration Flow

### Data Import Flow
1. User uploads file via `FileUpload` component
2. File stored in Supabase Storage (`imports` bucket)
3. Import job created via `import-worker` function
4. Background worker processes file:
   - Downloads and parses file
   - Validates against data model schema
   - Inserts records in batches
   - Updates job status and progress
5. UI polls for job status updates

### Campaign Creation Flow
1. User selects data model in `GuidedBulkSMSFlow`
2. System loads records from selected model
3. User applies filtering criteria
4. Recipients preview generated
5. User composes message and reviews
6. Campaign created via `campaign-api`
7. Campaign sent via messaging service integration

## Security Features

### Row-Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce user isolation

### File Upload Security
- Storage policies restrict access to user's own files
- File type validation (CSV, JSON only)
- File size limits (10MB max)
- Secure file URLs with expiration

### API Security
- JWT authentication required
- User context validation
- Input sanitization and validation
- Error handling without information leakage

## Deployment

### Database Migrations
```bash
# Apply all migrations
supabase db reset

# Or apply specific migrations
supabase migration up
```

### Function Deployment
```bash
# Deploy all data hub functions
./deploy-data-hub-functions.ps1

# Or deploy individually
supabase functions deploy data-hub-api --no-verify-jwt
supabase functions deploy import-worker --no-verify-jwt
supabase functions deploy campaign-api --no-verify-jwt
```

### Frontend Build
```bash
npm run build
```

## Usage Examples

### Creating a Data Model
```typescript
const { createDataModel } = useDataModels();

await createDataModel({
  name: "Customer Database",
  description: "Customer contact information",
  fields: [
    { id: "1", name: "name", type: "text" },
    { id: "2", name: "email", type: "email" },
    { id: "3", name: "phone", type: "phone" }
  ]
});
```

### Importing Data
```typescript
const { uploadFile, createImportJob } = useEnhancedDataHub();

// Upload file
const fileUrl = await uploadFile(file);

// Create import job
await createImportJob({
  modelId: "model-uuid",
  fileUrl,
  fileType: "csv"
});
```

### Creating a Campaign
```typescript
const { createCampaign } = useCampaigns();

await createCampaign({
  name: "Welcome Campaign",
  type: "sms",
  message: "Welcome to our service!",
  data_model_id: "model-uuid",
  target_criteria: { status: "active" }
});
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- JSONB for flexible data storage
- Batch operations for bulk imports
- Connection pooling

### File Processing
- Streaming for large files
- Batch processing to avoid memory issues
- Progress tracking for user feedback
- Error recovery mechanisms

### Frontend Optimization
- Lazy loading of components
- React Query for caching
- Optimistic updates
- Pagination for large datasets

## Future Enhancements

### Planned Features
1. **Advanced Filtering**: More complex query builders
2. **Data Validation**: Custom validation rules
3. **Scheduled Imports**: Recurring import jobs
4. **API Integrations**: Direct API data sources
5. **Advanced Analytics**: More detailed reporting
6. **Template Library**: Pre-built data models
7. **Collaboration**: Team data sharing
8. **Audit Logging**: Detailed activity tracking

### Scalability Improvements
1. **Queue System**: Redis-based job queue
2. **Microservices**: Service decomposition
3. **Caching**: Redis caching layer
4. **CDN**: File storage optimization
5. **Load Balancing**: Horizontal scaling

## Troubleshooting

### Common Issues

**Import Job Stuck in Processing**
- Check function logs: `supabase functions logs import-worker`
- Verify file format and size
- Check database connections

**Campaign Not Sending**
- Verify messaging service configuration
- Check recipient data format
- Review campaign status and error logs

**File Upload Failures**
- Check storage bucket policies
- Verify file size and type restrictions
- Review network connectivity

### Monitoring

**Database Performance**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

**Function Performance**
```bash
# Check function logs
supabase functions logs data-hub-api --follow

# Monitor function metrics
supabase functions list
```

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start Supabase: `supabase start`
4. Run migrations: `supabase db reset`
5. Deploy functions: `./deploy-data-hub-functions.ps1`
6. Start frontend: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- React Query for state management
- Tailwind CSS for styling

### Testing
- Unit tests for utilities
- Integration tests for API endpoints
- E2E tests for critical workflows
- Performance tests for bulk operations