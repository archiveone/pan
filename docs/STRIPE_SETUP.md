# Stripe Integration Setup Guide for GREIA

This guide provides detailed instructions for setting up Stripe integration in GREIA, covering payments, Connect (marketplace), and Identity verification.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Stripe Dashboard Setup](#stripe-dashboard-setup)
- [Required Keys](#required-keys)
- [Environment Variables](#environment-variables)
- [Webhook Configuration](#webhook-configuration)
- [Testing](#testing)
- [Going Live](#going-live)

## Prerequisites

1. [Stripe Account](https://dashboard.stripe.com/register)
2. GREIA platform running locally or deployed
3. Access to your deployment environment (Vercel/Railway/etc.)
4. [Stripe CLI](https://stripe.com/docs/stripe-cli) for local testing

## Stripe Dashboard Setup

### 1. Core Settings
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Settings → Business Settings
3. Configure:
   - Business name
   - Business type (Platform/Marketplace)
   - Country (Ireland/EU)
   - Default currency (EUR)

### 2. Enable Required Products
Navigate to Settings → Products and enable:

#### Payments
- Cards (required)
- Apple Pay / Google Pay (recommended)
- SEPA Direct Debit (for EU)
- iDEAL (for Netherlands)

#### Connect
1. Go to Connect settings
2. Set platform type to "Platform / Marketplace"
3. Choose account type:
   - Express (recommended)
   - Standard (more customizable)
4. Configure payouts:
   - Automatic payouts
   - Set payout schedule
   - Define minimum payout amount

#### Identity
1. Go to Identity settings
2. Create verification template:
   - Select document types
   - Configure verification requirements
   - Set branding options
3. Note the template ID (vtpl_...)

## Required Keys

Collect the following keys from your Stripe Dashboard:

### Core API Keys
```
Publishable Key: pk_test_...
Secret Key: sk_test_...
```

### Connect Platform
```
Client ID: ca_...
```

### Webhook Secrets
```
Platform Events: whsec_...
Connect Events: whsec_...
```

### Identity
```
Template ID: vtpl_...
```

## Environment Variables

Add these variables to your `.env.local` and deployment environment:

```env
# Stripe Core
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Connect
STRIPE_CLIENT_ID=ca_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_CONNECT_MODE=test

# Stripe Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Identity
STRIPE_IDENTITY_TEMPLATE=vtpl_...
NEXT_PUBLIC_IDENTITY_RETURN_URL=https://your-domain.com/verify-identity/complete
NEXT_PUBLIC_IDENTITY_REFRESH_URL=https://your-domain.com/verify-identity/retry

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Webhook Configuration

### 1. Platform Events Webhook
In Stripe Dashboard → Developers → Webhooks:

1. Add endpoint:
   ```
   URL: https://your-domain.com/api/payment
   ```

2. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   - identity.verification_session.verified
   - identity.verification_session.requires_input

3. Copy signing secret → STRIPE_WEBHOOK_SECRET

### 2. Connect Events Webhook
Add second endpoint:
   ```
   URL: https://your-domain.com/api/payment
   ```

1. Enable "Listen to Connect events"

2. Select events:
   - account.updated
   - charge.succeeded
   - payout.paid
   - transfer.created

3. Copy signing secret → STRIPE_CONNECT_WEBHOOK_SECRET

### Local Development
Run Stripe CLI for local testing:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/payment
```

## Testing

### 1. Test Cards
- Success: 4242 4242 4242 4242
- Requires Authentication: 4000 0025 0000 3155
- Declined: 4000 0000 0000 9995

### 2. Test Identity Verification
1. Use test documents provided by Stripe
2. Complete verification flow
3. Check webhook events
4. Verify user.verified is updated

### 3. Test Connect Onboarding
1. Create test connected account
2. Complete Express onboarding
3. Make test payment
4. Verify funds transfer
5. Check payout schedule

### 4. End-to-End Testing
1. Create listing
2. Complete booking
3. Process payment
4. Verify:
   - Payment success
   - Booking status update
   - Seller notification
   - Fund transfer
   - Payout scheduling

## Going Live

### 1. Pre-launch Checklist
- [ ] Switch to live API keys
- [ ] Update webhook endpoints
- [ ] Configure live domain URLs
- [ ] Test with real cards
- [ ] Verify Identity integration
- [ ] Test Connect onboarding
- [ ] Configure fraud prevention
- [ ] Set up monitoring

### 2. Production Settings
1. Update environment variables with live keys
2. Configure production webhooks
3. Update return URLs
4. Set up logging
5. Configure error tracking
6. Enable monitoring

### 3. Compliance
- Ensure Terms of Service are updated
- Add Privacy Policy
- Include Identity verification consent
- Set up data retention policies
- Configure GDPR compliance

### 4. Support Setup
- Document common issues
- Set up support channels
- Create response templates
- Configure error notifications
- Set up monitoring alerts

## Troubleshooting

### Common Issues

1. Webhook Errors
   - Verify signing secrets
   - Check endpoint URLs
   - Confirm event selection
   - Review logs

2. Payment Failures
   - Check API keys
   - Verify currency support
   - Review card errors
   - Check account status

3. Identity Verification
   - Confirm template ID
   - Check return URLs
   - Verify webhook events
   - Review session logs

4. Connect Issues
   - Verify client ID
   - Check onboarding flow
   - Review account status
   - Confirm webhook setup

### Support Resources
- [Stripe Documentation](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Testing Guide](https://stripe.com/docs/testing)
- [Connect Guide](https://stripe.com/docs/connect)
- [Identity Guide](https://stripe.com/docs/identity)

## Security Best Practices

1. API Security
   - Use webhook signatures
   - Validate all inputs
   - Implement rate limiting
   - Secure API keys

2. Data Handling
   - Minimize data storage
   - Encrypt sensitive data
   - Follow PCI compliance
   - Implement audit logs

3. Error Handling
   - Log errors securely
   - Handle failures gracefully
   - Notify on critical errors
   - Monitor transactions

4. Access Control
   - Limit admin access
   - Use role-based permissions
   - Audit access logs
   - Regular security reviews

## Maintenance

### Regular Tasks
1. Monitor webhook health
2. Review error logs
3. Update API versions
4. Check compliance updates
5. Review security settings

### Monitoring
1. Set up alerts for:
   - Failed payments
   - Webhook errors
   - Identity verification issues
   - Connect account problems
   - Suspicious activity

2. Regular reviews of:
   - Transaction logs
   - Error rates
   - Verification success rates
   - Payout status
   - Account health

---

For additional support, contact:
- Technical Support: support@greia.dev
- Stripe Support: [Stripe Support Portal](https://support.stripe.com)