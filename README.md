# GREIA - Life's Operating System

GREIA is a comprehensive platform that unifies Properties (buy/rent/sell), Services (trades/professional), Leisure (rentals/experiences), and Connect (social + CRM) with a freemium model.

## Vision

One super-app for lifestyle, property, and networking that serves as the digital fabric of everyday life.

## Core Pillars

### 1. Properties
- Buy, rent, sell across residential, commercial, luxury, timeshares
- Private marketplace
- Valuation tools
- Virtual viewings
- Property management

### 2. Services
- Trades and contractors
- Professional services
- Specialists
- Booking management
- Service ratings

### 3. Leisure
- Rentals (cars, boats, venues)
- Experiences (gigs, tours, dining)
- Event management
- Availability calendar
- Dynamic pricing

### 4. Connect
- Social feeds
- CRM for individuals & companies
- Networking groups
- Messaging system
- Professional profiles

## Key Features

### Advanced Search System
- Universal search across all pillars
- Real-time suggestions
- Location-based search
- Smart filters
- Recent searches
- Trending searches
- Category-specific filters

### Beautiful Listing Cards
- **PropertyCard**
  - Image galleries
  - Property details
  - Agent info
  - Ratings
  - Sharing
  - Favorites
  - Open house info
  - Multiple variants

- **ServiceCard**
  - Provider stats
  - Rating breakdowns
  - Availability calendar
  - Certifications
  - Insurance info
  - Instant booking

- **LeisureCard**
  - Event/rental types
  - Dynamic pricing
  - Schedule info
  - Amenities
  - Requirements
  - Accessibility features

### Verification System
- **Multi-Level Verification**
  - Basic verification (Level 1)
  - Professional verification (Level 2)
  - Licensed agent verification (Level 3)
  - Premium agent verification (Level 4)

- **Apple-Style UX**
  - Intuitive step-by-step process
  - Visual guides
  - Real-time feedback
  - Smooth animations
  - Trust indicators
  - Mobile-responsive

- **Document Verification**
  - ID verification
  - Address proof
  - Professional licenses
  - Insurance certificates
  - Agency documentation
  - Automated checks

- **Agent Verification**
  - License validation
  - Agency verification
  - Insurance checks
  - Professional credentials
  - Enhanced trust features
  - Premium tools access

### Core Features
- Unified listing flow
- Built-in CRM
- Social networking
- Stripe Identity verification
- Real-time messaging
- Booking system
- Payment processing
- Freemium model

## Tech Stack

### Frontend
- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide icons
- Framer Motion

### Backend
- Prisma
- PostgreSQL
- NextAuth
- Stripe
- Pusher

### Key Libraries
- `@radix-ui/*` - Accessible UI components
- `@prisma/client` - Database ORM
- `@stripe/stripe-js` - Payments & Identity
- `pusher-js` - Real-time features
- `date-fns` - Date manipulation
- `framer-motion` - Animations

## Development

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
Stripe Account
Pusher Account
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/greia-los.git

# Install dependencies
cd greia-los
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Pusher
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."
```

## Project Structure

```
greia-los/
├── app/                   # Next.js app router pages
├── components/           # React components
│   ├── listings/        # Listing cards & related
│   ├── search/         # Search components
│   ├── verification/   # Verification system
│   └── ui/            # Base UI components
├── lib/                # Utility functions
│   ├── verification/  # Verification services
│   └── api/          # API utilities
├── prisma/            # Database schema & migrations
└── public/           # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- [Prisma](https://www.prisma.io/)