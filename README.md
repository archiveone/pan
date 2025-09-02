# GREIA - Life's Operating System

GREIA is a comprehensive platform that unifies Properties (buy/rent/sell), Services (trades/professional), Leisure (rentals/experiences), and Connect (social + CRM) with a freemium model.

## Current Development Status (as of September 2, 2025)

### ✅ Properties Marketplace - Core Implementation
1. **Database Schema**
   - User & Auth models with roles (USER/AGENT/ADMIN)
   - Property listings with rich metadata
   - Views, favorites, enquiries tracking
   - Agent profiles and verification

2. **API Routes**
   - `GET /api/properties` - List with filters/pagination
   - `POST /api/properties` - Create new listing
   - `GET/PUT/DELETE /api/properties/[id]` - Single property operations

3. **React Components**
   - PropertyCard & PropertyGrid components
   - PropertyListingForm with validation
   - Property details page with image gallery
   - Responsive design implementation

### ✅ Authentication System
1. **NextAuth Integration**
   - Google OAuth provider
   - Credentials provider with bcrypt
   - JWT session handling
   - Role-based access control

2. **User Management**
   - Registration API with validation
   - Login/Signup pages
   - Protected routes middleware
   - Error handling pages

### 🔄 Next Development Priorities

1. **Image Upload System**
   - AWS S3 integration
   - Image optimization
   - Gallery management
   - Upload progress tracking

2. **Real-time Features**
   - Pusher integration
   - Property view tracking
   - Live notifications
   - Chat functionality

3. **Services Marketplace**
   - Service provider profiles
   - Service listing components
   - Booking system
   - Review system

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Backend**: Prisma + PostgreSQL
- **Authentication**: NextAuth (Google + Credentials)
- **Payments**: Stripe (Identity + Payments)
- **Real-time**: Pusher
- **Storage**: AWS S3 (pending)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google OAuth credentials
- Stripe account
- AWS account (for S3)
- Pusher account

### Environment Variables
Create a `.env` file with:

\`\`\`env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# Pusher (for real-time)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# AWS S3 (for image upload)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
\`\`\`

### Database Setup

1. Run Prisma migrations:
\`\`\`bash
npx prisma migrate dev
\`\`\`

2. Seed initial data:
\`\`\`bash
npx prisma db seed
\`\`\`

## Development Guidelines

### Code Structure
- `/app` - Next.js 13 app directory
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations

### API Routes
- `/api/properties/*` - Property marketplace endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/upload/*` - Image upload endpoints (pending)
- `/api/services/*` - Service marketplace endpoints (pending)

### Component Guidelines
- Use TypeScript for all components
- Implement proper error boundaries
- Follow accessibility guidelines
- Include loading states
- Add proper documentation

## Contributing

This project is being developed using a GitHub-only approach. All code changes are made directly through GitHub's API to ensure proper version control and backup.

### Development Process
1. Create feature branch
2. Implement changes via GitHub API
3. Create pull request
4. Review and merge

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration
- Format with Prettier
- Write meaningful commit messages

## License

Copyright © 2025 GREIA. All rights reserved.