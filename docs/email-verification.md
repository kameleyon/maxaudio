# Email Verification System

## Overview
The email verification system uses JWT-based tokens and Nodemailer for sending verification and password reset emails.

## Setup

1. Configure environment variables:
```bash
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=AudioMax <noreply@audiomax.com>
```

2. For Gmail, you need to:
   - Enable 2-Step Verification
   - Generate an App Password:
     1. Go to Google Account Settings
     2. Security > 2-Step Verification
     3. App Passwords > Generate
     4. Use this password as SMTP_PASS

## Testing

Use the test script to verify email configuration:
```bash
node server/scripts/test-email.js your-test-email@example.com
```

The script will:
- Check environment variables
- Send a test verification email
- Send a test password reset email

## API Endpoints

### Email Verification
```http
GET /api/auth/verify-email?token={verification_token}
```
- Verifies user's email address
- Token expires in 24 hours

### Password Reset
```http
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
```
- Sends password reset email

```http
POST /api/auth/reset-password
{
  "token": "reset_token",
  "password": "new_password"
}
```
- Resets user's password
- Token expires in 1 hour

## Email Templates

### Verification Email
- Subject: "Verify your AudioMax account"
- Contains verification link
- Styled with AudioMax branding

### Password Reset Email
- Subject: "Reset your AudioMax password"
- Contains reset password link
- Includes security notice

## Security Features

1. JWT-based tokens with:
   - Purpose-specific claims
   - Configurable expiration
   - Signature verification

2. Rate limiting on endpoints:
   - Prevents brute force attempts
   - Configurable windows and limits

3. Secure token validation:
   - Purpose verification
   - Expiration checking
   - Error handling

## Error Handling

The system handles common errors:
- Invalid/expired tokens
- User not found
- Email sending failures
- Rate limit exceeded

## Database Schema

User model includes:
```javascript
{
  isVerified: Boolean,  // Email verification status
  email: String,        // Verified email address
  // ... other fields
}
```

## Production Considerations

1. Email Service:
   - Consider using SendGrid/AWS SES for production
   - Set up email domain verification
   - Monitor delivery rates

2. Security:
   - Enable SMTP secure (TLS)
   - Use environment-specific secrets
   - Implement IP-based rate limiting

3. Monitoring:
   - Track verification success rates
   - Monitor email delivery status
   - Log security events
