# GREIA Platform - Apps Directory

This directory contains the core applications that power GREIA - Life's Operating System.

## What We Have

### Core Applications
1. **Web Application** (`/web`)
   - Next.js 13+ with App Router
   - TypeScript + Tailwind CSS implementation
   - Core platform interface and user experience
   - Responsive design for all devices

### Authentication & User Management
- NextAuth integration with:
  - Google OAuth
  - Credentials authentication
- User profiles and verification status

### Design System
- shadcn/ui components
- Radix UI primitives
- Lucide icons
- Tailwind CSS styling

### Database & API
- Prisma ORM setup
- PostgreSQL database configuration
- API routes structure

## What We Need

### 1. Multi-Marketplace Implementation
- [ ] Unified listing flow
- [ ] Category management system
- [ ] Search and filter functionality
- [ ] Media handling services
- [ ] Location services integration

### 2. Verification System
- [ ] Stripe Identity integration
- [ ] KYC verification flow
- [ ] Agent verification process
- [ ] Business verification system

### 3. CRM System
- [ ] Contact management
- [ ] Lead tracking
- [ ] Task management
- [ ] Activity logging
- [ ] Notes system
- [ ] Kanban board interface

### 4. Real-time Features
- [ ] Pusher integration
- [ ] Messaging system
- [ ] Notification center
- [ ] Real-time updates

### 5. Social Networking
- [ ] User feeds
- [ ] Post creation and management
- [ ] Comments and reactions
- [ ] Social profile system
- [ ] CRM Groups functionality

### 6. Specialized Marketplaces
- [ ] Private Property Marketplace
  - Property submission flow
  - Agent interest system
  - Listing assignment logic
- [ ] Valuation Marketplace
  - Valuation request system
  - Offer management
  - Submission tracking

### 7. Payment & Booking
- [ ] Stripe payment integration
- [ ] Booking management system
- [ ] Commission tracking
- [ ] Subscription handling
- [ ] Payment history

### 8. Security & Compliance
- [ ] Data privacy implementation
- [ ] GDPR compliance
- [ ] Rate limiting
- [ ] Error handling
- [ ] Audit logging

## Development Priorities

1. **Core Platform Infrastructure**
   - Complete authentication system
   - Basic user profiles
   - Database structure
   - API foundations

2. **Lead Generation System**
   - Property upload flow
   - Agent routing system
   - Commission tracking

3. **Valuation Marketplace**
   - Property owner requests
   - Agent response system
   - Valuation workflow

4. **CRM & Social Features**
   - Basic CRM functionality
   - User networking
   - Messaging system

5. **Additional Marketplaces**
   - Services marketplace
   - Leisure offerings
   - Experience bookings

## Tech Stack Overview

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **Backend**: Prisma, PostgreSQL
- **Authentication**: NextAuth
- **Payments**: Stripe
- **Real-time**: Pusher
- **UI Components**: shadcn/ui, Radix
- **Icons**: Lucide

## Getting Started

1. Each app in this directory follows standard Next.js conventions
2. Configuration files are centralized at the root level
3. Shared components and utilities are in dedicated directories
4. Environment variables are managed per environment

## Contributing

- Follow TypeScript best practices
- Maintain consistent code style
- Write comprehensive tests
- Document all new features
- Create detailed pull requests