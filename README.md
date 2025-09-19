# GREIA - Life's Operating System

GREIA is a comprehensive platform that unifies Properties, Services, Leisure, and Connect into a single, powerful ecosystem. Built with Next.js 13, TypeScript, and a modern tech stack, GREIA serves as the digital fabric of everyday life.

## Current Status

### Core Infrastructure ✅
- **Database Schema**: Complete PostgreSQL schema with Prisma ORM
- **API Routes**: Full REST API implementation
- **Authentication**: NextAuth with multiple providers
- **File Storage**: Cloud storage integration
- **Real-time**: Pusher integration
- **Payments**: Stripe integration with Identity verification

### Frontend Implementation ✅
- **Dashboard System**: Complete management interface
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support
- **UI Components**: shadcn/ui + Radix

## Platform Components

### 1. Properties Module
- Property listings (sale/rent)
- Property management
- Viewing scheduling
- Lead generation
- Analytics

### 2. Services Module
- Service listings
- Provider management
- Booking system
- Review system
- Service analytics

### 3. Leisure Module
- Activity/rental listings
- Availability management
- Booking system
- Experience marketplace
- Usage tracking

### 4. Connect Module
- Professional networking
- CRM system
- Messaging
- Group management
- Social features

## Technical Architecture

### Database Models
- User & Authentication
- Properties & Listings
- Services & Bookings
- Leisure Activities
- CRM & Leads
- Social Features
- Verification System

### API Infrastructure
- RESTful endpoints
- Real-time updates
- File handling
- Payment processing
- Analytics tracking

### Core Libraries
- \`auth.ts\`: Authentication system
- \`media.ts\`: Media handling
- \`stripe.ts\`: Payment processing
- \`stripe-identity.ts\`: Identity verification
- \`subscription.ts\`: Subscription management
- \`pusher.ts\`: Real-time features

## Launch Requirements

### 1. Environment Setup
\`\`\`bash
# Required environment variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
\`\`\`

### 2. Database Setup
\`\`\`bash
# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
\`\`\`

### 3. Third-party Services
- Stripe Account Configuration
- Email Service Setup
- Storage Service Configuration
- Analytics Integration

### 4. Deployment
- Vercel Project Setup
- Environment Configuration
- Domain Setup
- SSL Configuration

## Tech Stack

### Frontend
- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide Icons

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js

### Services
- Stripe (Payments + Identity)
- Pusher (Real-time)
- Cloud Storage
- Email Service

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm/npm/yarn

### Setup
1. Clone the repository
\`\`\`bash
git clone https://github.com/d4rent/greia-los.git
cd greia-los
\`\`\`

2. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env
\`\`\`

4. Run migrations
\`\`\`bash
npx prisma migrate dev
\`\`\`

5. Start development server
\`\`\`bash
pnpm dev
\`\`\`

## License
Proprietary - All rights reserved

## Support
For support, email support@greia.com