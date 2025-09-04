# GREIA Platform - Apps Directory

This directory contains the core applications that power GREIA - Life's Operating System.

## Current Implementation Status

### Core Features (Implemented in /app)

1. **Multi-marketplace Implementation** ✅
   - Unified listing system
   - Category management
   - Search functionality
   - Media handling
   - Location services

2. **Verification System** ✅
   - Stripe Identity integration
   - KYC verification flow
   - Agent verification
   - Business verification

3. **CRM System** ✅
   - Contact management
   - Lead tracking
   - Task management
   - Activity logging
   - Notes system
   - Kanban interface

4. **Real-time Features** ✅
   - Pusher integration
   - Messaging system
   - Notification center
   - Real-time updates

5. **Social Networking** ✅
   - User feeds
   - Post management
   - Comments and reactions
   - Social profiles
   - CRM Groups

6. **Specialized Marketplaces** ✅
   - Private Property Marketplace
     - Property submissions
     - Agent interest system
     - Listing assignments
   - Valuation Marketplace
     - Request system
     - Offer management
     - Submission tracking

7. **Payment & Booking** ✅
   - Stripe integration
   - Booking management
   - Commission tracking
   - Subscription handling
   - Payment history

8. **Security & Compliance** ✅
   - Data privacy
   - GDPR compliance
   - Rate limiting
   - Error handling
   - Audit logging

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Prisma + PostgreSQL
- **Authentication**: NextAuth (Google + Credentials)
- **Payments**: Stripe (Identity + Payments)
- **Real-time**: Pusher
- **UI**: shadcn/ui + Radix + Lucide icons

## Directory Structure

```
/app
├── api/           # API routes
├── auth/          # Authentication
├── components/    # Shared components
├── marketplace/   # Multi-marketplace features
├── crm/          # CRM functionality
├── social/       # Social networking
├── messaging/    # Real-time messaging
├── payments/     # Payment processing
└── utils/        # Shared utilities
```

## Key Features

### Lead Generation System
- Property upload workflow
- Agent routing system
- 5% commission tracking
- Area-based matching

### Valuation System
- Property owner requests
- Agent response handling
- Valuation workflow
- Market analysis tools

### CRM & Scheduling
- Contact management
- Task scheduling
- Activity tracking
- Team collaboration

### Verification
- User verification
- Business verification
- Agent verification
- Document processing

### Agent Referral Programme
- 20% referral split
- Automated tracking
- Performance metrics
- Payment processing

## Development Guidelines

1. Follow TypeScript best practices
2. Maintain consistent code style
3. Write comprehensive tests
4. Document new features
5. Create detailed PRs

## Getting Started

1. Review existing implementations in /app
2. Follow established patterns
3. Use existing components
4. Maintain type safety
5. Test thoroughly

## Contributing

- Follow existing code patterns
- Maintain TypeScript standards
- Write clear documentation
- Include tests
- Follow PR template