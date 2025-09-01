# Ireland Listings - Unified Marketplace

A unified platform combining properties, services, and experiences - like Zillow + Airbnb + Thumbtack + Eventbrite for Ireland.

## Features

### Core Concept
- **Unified Listings**: Properties, services, and experiences in one platform
- **Smart Cross-Recommendations**: Ryanair-style upselling across categories
- **Ireland-Focused**: Starting with the Irish market

### Property Management
- All property types: residential, commercial, apartments, studios, timeshares, luxury
- **Licensed Agent Requirement**: Only licensed real estate agents can list residential properties for sale/rent
- **Private Marketplace**: Unlicensed property owners connect with local licensed agents
- Commercial properties: direct upload (no license required)

### User Verification
- **Stripe Identity**: Passport verification for all users
- **Document Upload**: Simple system for license verification
- **Role-Based Permissions**: Different access levels based on verification status

### Smart Recommendations
Examples of cross-category suggestions:
- Wedding venue → photographers, caterers, florists
- Apartment rental → moving services, utilities, local experiences
- Event planning → venues, catering, entertainment

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with credentials provider
- **Database**: PostgreSQL with Prisma ORM
- **Verification**: Stripe Identity for document verification
- **File Upload**: Sharp for image processing
- **UI Components**: Lucide React icons, Sonner for notifications

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for identity verification)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your database URL, NextAuth secret, and Stripe keys.

4. Set up the database:
   ```bash
   bunx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js sessions
- `NEXTAUTH_URL`: Your app's URL
- `STRIPE_SECRET_KEY`: Stripe secret key for identity verification
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public Stripe key for frontend

## Database Schema

### Key Models
- **User**: Authentication, verification status, agent licensing
- **Listing**: Unified model for properties, services, and experiences
- **Document**: File uploads for verification
- **ListingRecommendation**: Cross-category recommendations
- **AgentRequest**: Connects unlicensed property owners with agents

### Listing Categories
- **PROPERTY**: All property types with agent licensing rules
- **SERVICE**: Contractors, professionals, freelancers, consultants
- **LEISURE**: Events, tours, experiences, entertainment, dining

## Key Features

### Unified Upload Flow
- Single form for all listing types
- Smart tagging system for categorization
- Image upload with automatic processing
- County-based agent matching for properties

### Verification System
- Stripe Identity integration for passport verification
- Document upload for real estate licenses
- Role-based access control
- Automatic verification status updates

### Smart Recommendations
- Cross-category suggestion engine
- Relevance scoring system
- Ryanair-style upselling flow
- Location-based matching

## Deployment

The app is designed to work with:
- Vercel (recommended for Next.js)
- Railway or Heroku for PostgreSQL
- Stripe for identity verification

## License

All rights reserved.
