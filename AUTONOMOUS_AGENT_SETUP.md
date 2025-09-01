# Greia Platform - Autonomous Agent Setup Guide

## Repository Setup
**Manual GitHub Setup Required:**
1. Create new GitHub repository: `greia-platform`
2. Push local code from: `/home/code/ireland-listings/`
3. Repository contains complete platform with all pages and functionality

## Platform Overview
- **Live URL**: https://greia.lindy.site (port 3001)
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL (localhost:5432)
- **Authentication**: NextAuth.js
- **UI**: shadcn/ui + Tailwind CSS

## Complete Feature Set
✅ Homepage with search and categories
✅ Advanced browse page with filters
✅ Individual listing detail pages (/listing/[id])
✅ User profile pages (/profile/[id])
✅ Account settings (/settings)
✅ Help & support system (/help)
✅ Dashboard and authentication
✅ Listing creation and management
✅ Stripe Identity verification

## Agent Access Requirements

### 1. Codebase Access
- **Directory**: `/home/code/ireland-listings/`
- **Git**: Repository initialized and committed
- **Structure**: Standard Next.js app directory structure

### 2. Database Access
- **Host**: localhost:5432
- **Database**: greia_platform (create with: `createdb -h localhost greia_platform`)
- **Credentials**: Use existing PGUSER/PGPASSWORD environment variables
- **Schema**: Defined in `prisma/schema.prisma`

### 3. Environment Variables
```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://greia.lindy.site
PGUSER=existing-user
PGPASSWORD=existing-password
PGDATABASE=greia_platform
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Key Files for Agent
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `app/` - All pages and API routes
- `components/` - Reusable UI components
- `lib/` - Utilities and configurations

## Agent Capabilities Needed
- File system read/write access
- Database connection and queries
- Environment variable access
- Terminal/command execution
- Web browser testing capabilities

## Recommended Agent Tasks
1. **Content Management**: Update listings, manage user data
2. **Customer Support**: Handle help requests, user issues
3. **Platform Monitoring**: Check for errors, performance issues
4. **Feature Development**: Add new functionality, fix bugs
5. **Database Management**: Run migrations, optimize queries

## Getting Started
1. Clone/access the codebase at `/home/code/ireland-listings/`
2. Install dependencies: `bun install`
3. Set up database: `createdb -h localhost greia_platform`
4. Run migrations: `bunx prisma migrate deploy`
5. Start development: `bun run dev`

The platform is production-ready with no errors and fully functional.
