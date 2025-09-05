# Twilio Video Integration Setup Guide for GREIA

This guide provides detailed instructions for setting up Twilio Programmable Video in GREIA for real-time video chat functionality.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Twilio Account Setup](#twilio-account-setup)
- [Required Keys](#required-keys)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Going Live](#going-live)

## Prerequisites

1. [Twilio Account](https://www.twilio.com/try-twilio)
2. GREIA platform running locally or deployed
3. Access to your deployment environment (Vercel/Railway/etc.)

## Twilio Account Setup

### 1. Create Twilio Account
1. Go to [Twilio Sign Up](https://www.twilio.com/try-twilio)
2. Complete the registration process
3. Verify your email and phone number

### 2. Enable Programmable Video
1. Navigate to Console → Programmable Video
2. Enable the Video service
3. Accept the terms of service

### 3. Create API Keys
1. Go to Console → Account → API Keys
2. Click "Create New API Key"
3. Name it "GREIA Video Integration"
4. Select "Standard" type
5. Store the API Key and Secret securely

## Required Keys

Collect the following from your Twilio Console:

### Core Credentials
```
Account SID: AC...
Auth Token: your_auth_token
```

### API Keys
```
API Key SID: SK...
API Key Secret: your_api_key_secret
```

## Environment Variables

Add these to your `.env.local` and deployment environment:

```env
# Twilio Core
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token

# Twilio API Keys
TWILIO_API_KEY=SK...
TWILIO_API_SECRET=your_api_key_secret

# Optional Configuration
TWILIO_REGION=gll # Global Low Latency
TWILIO_MAX_PARTICIPANTS=4
TWILIO_RECORDING_ENABLED=false
```

## Implementation Details

### 1. Room Types
GREIA uses Twilio's Group Rooms which support:
- Up to 50 participants
- Video and audio tracks
- Screen sharing
- Recording (optional)
- Chat during calls

### 2. Features Enabled
- Camera toggle
- Microphone toggle
- Screen sharing
- Background blur
- Chat in call
- Participant management
- Connection quality indicators

### 3. Quality Settings
Default configuration in GREIA:
```javascript
const videoConstraints = {
  width: 640,
  height: 480,
  frameRate: 24
};

const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
};
```

## Testing

### 1. Local Testing
1. Run development server
2. Open two browser windows
3. Join same room from both
4. Test all features:
   - Video toggle
   - Audio toggle
   - Screen share
   - Chat
   - Connection handling

### 2. Test Scenarios
Test these scenarios:
- Multiple participants joining/leaving
- Network interruptions
- Device switching
- Screen sharing
- Background blur
- Chat during call
- Room controls

### 3. Mobile Testing
Verify functionality on:
- iOS Safari
- Android Chrome
- Mobile data connection
- Different device orientations

## Going Live

### 1. Pre-launch Checklist
- [ ] Switch to production API keys
- [ ] Configure error monitoring
- [ ] Set up usage alerts
- [ ] Test on all target devices
- [ ] Verify bandwidth requirements
- [ ] Check browser compatibility
- [ ] Test fallback scenarios

### 2. Production Settings
1. Update environment variables
2. Configure logging
3. Set up monitoring
4. Enable error tracking
5. Configure analytics

### 3. Monitoring Setup
Monitor:
- Room creation/deletion
- Participant connections
- Error rates
- Bandwidth usage
- Quality metrics

## Troubleshooting

### Common Issues

1. Connection Problems
   - Check API keys
   - Verify network connectivity
   - Check browser permissions
   - Verify device access

2. Quality Issues
   - Check bandwidth
   - Verify device capabilities
   - Review quality settings
   - Check network conditions

3. Device Problems
   - Verify permissions
   - Check device selection
   - Test fallback devices
   - Review browser support

### Support Resources
- [Twilio Video Docs](https://www.twilio.com/docs/video)
- [API Reference](https://www.twilio.com/docs/video/api)
- [JavaScript SDK](https://www.twilio.com/docs/video/javascript)
- [Troubleshooting Guide](https://www.twilio.com/docs/video/troubleshooting)

## Security Best Practices

1. Access Control
   - Use access tokens
   - Implement room passwords
   - Set participant limits
   - Monitor room access

2. Data Privacy
   - Enable encryption
   - Manage recordings
   - Handle chat data
   - Secure metadata

3. Compliance
   - Review data handling
   - Check regional requirements
   - Document policies
   - Monitor usage

## Maintenance

### Regular Tasks
1. Monitor usage
2. Review error logs
3. Update SDK versions
4. Check performance
5. Review security

### Monitoring Alerts
Set up alerts for:
- Error spikes
- High latency
- Connection failures
- Unusual usage patterns
- API limit approaches

## Cost Management

### Usage Monitoring
1. Track minutes used
2. Monitor participant counts
3. Review recording usage
4. Check bandwidth consumption

### Optimization Tips
1. Adjust quality settings
2. Manage room lifetime
3. Control recording usage
4. Optimize participant limits

---

For additional support:
- Technical Support: support@greia.dev
- Twilio Support: [Twilio Support](https://www.twilio.com/help/contact)
- Documentation: [Twilio Docs](https://www.twilio.com/docs)