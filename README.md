# GREIA - Life's Operating System

GREIA is a comprehensive platform that unifies Properties (buy/rent/sell), Services (trades/professional), Leisure (rentals/experiences), and Connect (social + CRM) with a freemium model.

## Vision

One super-app for lifestyle, property, and networking that serves as the digital fabric of everyday life.

## Core Pillars

1. **Properties**
   - Buy, rent, sell
   - Residential, commercial, luxury
   - Timeshares
   - Private marketplace
   - Valuation marketplace

2. **Services**
   - Trades and contractors
   - Professional services
   - Specialists
   - Verified providers

3. **Leisure**
   - Rentals (cars, boats, venues)
   - Experiences (gigs, tours, dining)
   - Event bookings
   - Activity planning

4. **Connect**
   - Social feeds
   - CRM for individuals & companies
   - Networking groups
   - Professional connections

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Google + Credentials)
- **Identity Verification**: Stripe Identity
- **Payments**: Stripe
- **Real-time Features**: Pusher
- **UI Components**: shadcn/ui + Radix + Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Google Cloud project
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/d4rent/griea-los.git
cd griea-los
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```env
# Create a .env file with the following variables

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/griea"

# Authentication
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Pusher (for real-time features)
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
pnpm dev
```

### External Service Setup

#### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google OAuth2 API
4. Configure the OAuth consent screen:
   - Add authorized domains
   - Set application type (Internal/External)
   - Add necessary scopes
5. Create OAuth 2.0 credentials:
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your .env file

#### 2. Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Enable Identity Verification:
   - Go to Settings → Identity
   - Configure verification requirements
   - Set up branding and customization
3. Get your API keys:
   - Dashboard → Developers → API keys
   - Copy Secret key and Publishable key
4. Set up webhooks:
   - Dashboard → Developers → Webhooks
   - Add endpoint: `{your-domain}/api/webhooks/stripe`
   - Select events to listen for:
     - `identity.verification_session.verified`
     - `identity.verification_session.requires_input`
     - `identity.verification_session.canceled`
   - Copy the webhook signing secret

#### 3. PostgreSQL Database

1. Set up a PostgreSQL database (local or hosted)
2. Update the DATABASE_URL in your .env file
3. Run migrations:
```bash
npx prisma migrate dev
```

## Development Guidelines

### Code Structure

```
griea-los/
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── verification/      # Identity verification pages
│   └── ...               # Other app routes
├── components/            # React components
│   ├── providers/        # Context providers
│   └── ui/              # UI components
├── lib/                  # Utility functions
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`

### Commit Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

## License

Proprietary - All rights reserved

## Support

For support, email support@greia.com or join our Slack channel.