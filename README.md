# GREIA - Life's Operating System

GREIA is Ireland's premier platform unifying Properties, Services, Leisure, and Connect into one comprehensive super-app.

## 🚀 Launch Status Update

### ✅ Completed
1. **Schema Updates**
   - Added Lead and Task models
   - Full CRM functionality implemented
   - Property, Service, Leisure models ready

2. **API Unification**
   - Unified property/listing endpoints under `/api/properties`
   - Deprecated `/api/listings` with redirect handler
   - Added deprecation notices

3. **SEO Improvements**
   - Dynamic sitemap generation
   - Robots.txt configuration
   - OpenGraph metadata for all listings

### 🏗️ In Progress
1. **Email/Pusher Notifications**
   - Lead creation notifications
   - Task assignments
   - Real-time updates

2. **Production Setup**
   - S3 bucket configuration
   - Stripe webhook testing
   - Environment flags

## 🔑 Core Features

### Properties
- Free property listings for agents
- Rich media support
- Advanced search and filters
- Verified agent badges

### Services
- Professional service listings
- Weekly subscription model
- Service provider verification
- Booking system

### Leisure
- Experience and venue rentals
- Free listings with quota
- Real-time availability
- Instant booking

### Connect
- Built-in CRM for all users
- Social networking
- Business profiles
- Lead management

## 📚 API Documentation

### Properties API (Primary Endpoint)
```typescript
GET /api/properties
- Filters: type, price range, bedrooms, location
- Pagination support
- Returns verified properties with owner details

POST /api/properties
- Create new property listings
- Requires authentication
- Supports rich media

PATCH /api/properties
- Bulk update properties
- Owner verification
- Status management
```

### ⚠️ Deprecated Endpoints
The `/api/listings` endpoint is deprecated and will redirect to `/api/properties`. Please update your API calls.

### CRM APIs
```typescript
/api/lead-generation
- Handle incoming leads
- Auto-task creation
- Email notifications

/api/crm/leads
- Lead management
- Status tracking
- Follow-up scheduling

/api/crm/tasks
- Task assignments
- Priority management
- Due date tracking
```

## 🛠️ Tech Stack
- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth
- Stripe (Identity + Payments)
- Pusher
- shadcn/ui + Radix

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/d4rent/griea-los.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run migrations
```bash
npx prisma migrate dev
```

5. Start development server
```bash
npm run dev
```

## 🔐 Environment Variables

Required variables in `.env`:
```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

## 🎯 Feature Flags

Control features via environment variables:
```bash
ENABLE_PROPERTY_SUBMISSIONS=true
ENABLE_AGENT_VERIFICATION=true
ENABLE_SERVICE_LISTINGS=true
ENABLE_LEISURE_LISTINGS=true
```

## 📝 License
Copyright © 2025 GREIA. All rights reserved.