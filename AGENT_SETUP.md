# PAN Platform - Autonomous Agent Setup

## Database Access
- PostgreSQL running on localhost:5432
- Database: greia_platform
- Environment variables: PGUSER, PGPASSWORD already configured
- Prisma ORM with full schema in prisma/schema.prisma

## Codebase Structure
- Next.js 14 app with TypeScript
- Complete pages: /, /browse, /listing/[id], /profile/[id], /settings, /help, /dashboard
- API routes: /api/listings, /api/upload, /api/verify
- Components: UI library (shadcn/ui), forms, filters, cards
- Authentication: NextAuth.js configured
- File uploads: Configured for images/documents

## Platform Features
✅ Property/Service/Leisure listings
✅ User profiles with verification
✅ Advanced search and filtering
✅ Stripe Identity verification
✅ Complete user management
✅ Help and support system

## Live Platform
URL: https://greia.lindy.site
Port: 3001

## Agent Access Requirements
1. File system access to: /home/code/ireland-listings/
2. Database connection with existing credentials
3. Environment variables access
4. Git repository access (initialized and committed)

The platform is production-ready with no errors.
