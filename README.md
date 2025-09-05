# GREIA - Life's Operating System 🌟

GREIA is a comprehensive platform that unifies Properties, Services, Leisure, and Connect into one super-app that serves as the digital fabric of everyday life.

## 🎯 Vision

One unified platform for lifestyle, property, and networking, bringing together:
- Properties: Buy, rent, sell across residential, commercial, luxury
- Services: Trades, contractors, professional services
- Leisure: Rentals, experiences, events
- Connect: Social feeds, CRM, networking

## 🚀 Features

### Core Platform Features
- Multi-marketplace architecture
- Real-time messaging and notifications
- Video calls with screen sharing
- Built-in CRM for all users
- Social networking
- Unified listing flow
- Booking and payment systems
- Identity verification
- Mobile-responsive design

### New Features (September 2025)
- Advanced search and filtering system
- Real-time notification center
- Comprehensive booking system
- Stripe payment integration
- Multi-currency support
- Insurance options for bookings
- Enhanced user verification

## 🛠 Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma, PostgreSQL
- **Authentication**: NextAuth.js (Google + Credentials)
- **Payments**: Stripe (Payments, Connect, Identity)
- **Real-time**: Pusher
- **UI Components**: shadcn/ui, Radix, Lucide icons
- **Video Calls**: Twilio
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe Account
- Pusher Account
- Twilio Account
- Google Cloud Account (for OAuth)

## 🔧 Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/d4rent/griea-los.git
   cd griea-los
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   bun install
   # or
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Configure your environment variables:

   \`\`\`env
   # Base
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL="postgresql://..."

   # Authentication
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_CLIENT_ID=ca_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
   STRIPE_IDENTITY_TEMPLATE=vtpl_...
   NEXT_PUBLIC_STRIPE_CONNECT_MODE=test
   NEXT_PUBLIC_IDENTITY_RETURN_URL=http://localhost:3000/verify-identity/complete
   NEXT_PUBLIC_IDENTITY_REFRESH_URL=http://localhost:3000/verify-identity/retry

   # Pusher Configuration
   NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
   NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
   PUSHER_APP_ID=your-pusher-app-id
   PUSHER_SECRET=your-pusher-secret

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_API_KEY=your-twilio-api-key
   TWILIO_API_SECRET=your-twilio-api-secret
   \`\`\`

5. Initialize the database:
   \`\`\`bash
   npx prisma migrate dev
   npx prisma generate
   \`\`\`

6. Start the development server:
   \`\`\`bash
   bun dev
   # or
   npm run dev
   \`\`\`

## 🔐 Stripe Integration Setup

### 1. Required Stripe Products
- Payments
- Connect (Platform/Marketplace)
- Identity
- Webhooks

### 2. Stripe Dashboard Configuration
1. Enable required payment methods
2. Set up Connect platform type
3. Create Identity verification template
4. Configure webhook endpoints

### 3. Webhook Endpoints
Configure two webhook endpoints in Stripe Dashboard:

1. **Platform Events** (payments & identity)
   - URL: \`https://your-domain.com/api/payment\`
   - Events to listen for:
     - payment_intent.succeeded
     - payment_intent.payment_failed
     - payment_intent.canceled
     - identity.verification_session.verified
     - identity.verification_session.requires_input

2. **Connect Events**
   - URL: \`https://your-domain.com/api/payment\`
   - Enable "Listen to Connect events"
   - Events to listen for:
     - account.updated
     - charge.succeeded
     - payout.paid
     - transfer.created

### 4. Local Development
For local webhook testing:
1. Install Stripe CLI
2. Run: \`stripe listen --forward-to localhost:3000/api/payment\`

## 📱 Mobile Optimization

The platform is fully responsive with:
- Bottom navigation for mobile
- Pull-to-refresh functionality
- Bottom sheets for mobile forms
- Touch-optimized interactions
- Native-like animations

## 🔒 Security Features

- GDPR compliance
- Data encryption
- Secure payment processing
- Identity verification
- Input sanitization
- Rate limiting
- CSRF protection

## 🌍 Localization

- Multi-currency support
- Timezone handling
- Internationalized routing
- RTL support
- Language selection

## 📈 Performance

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- API response optimization
- Real-time updates

## 🧪 Testing

Run the test suite:
\`\`\`bash
bun test
# or
npm run test
\`\`\`

## 📚 Documentation

Additional documentation:
- [API Documentation](docs/API.md)
- [Component Library](docs/COMPONENTS.md)
- [Database Schema](docs/SCHEMA.md)
- [Testing Guide](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Stripe](https://stripe.com)
- [Pusher](https://pusher.com)
- [Twilio](https://twilio.com)

## 🆘 Support

For support, email support@greia.dev or join our [Discord community](https://discord.gg/greia).

---

Built with ❤️ by the GREIA team