# AudioMax

AudioMax is a sophisticated text-to-speech platform that combines advanced AI capabilities with intuitive voice customization features. It enables users to generate high-quality audio content with customizable voices, making it ideal for content creators, educators, and professionals.

## 🌟 Features

- **Advanced Text-to-Speech Generation**
  - High-quality voice synthesis using Google Cloud TTS
  - Multiple voice options and customization parameters
  - Real-time audio preview and adjustments

- **Studio Environment**
  - Professional audio editing interface
  - Content settings customization
  - Audio player with playback controls
  - Transcript editing capabilities

- **Voice Management**
  - Voice cloning capabilities
  - Favorite voices collection
  - Voice upload functionality
  - Custom voice actions and settings

- **File Management**
  - Organized file system for audio content
  - Search and filtering capabilities
  - File actions menu for easy management
  - Batch operations support

- **User Features**
  - Secure authentication with Clerk
  - User preferences management
  - Subscription plans with Stripe integration
  - Real-time usage tracking and analytics
  - Smart notification system

- **Subscription Management**
  - Free trial tier with basic features
  - Professional tier for content creators
  - Premium tier for enterprises
  - Flexible monthly/yearly billing
  - Real-time usage monitoring
  - Automatic billing and invoicing
  - Usage-based limits and alerts

- **Usage Analytics**
  - Real-time usage tracking
  - Historical usage data
  - Usage trend analysis
  - Subscription tier limits monitoring
  - Usage alerts and notifications

## 🏗 Architecture

The application is built with a modern tech stack:

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS + Styled Components
- **State Management**: React Context + React Query
- **Authentication**: Clerk Authentication
- **Payments**: Stripe Integration with webhooks
- **Backend**: Node.js with Express
- **Cloud Services**: Google Cloud TTS, OpenRouter AI
- **Deployment**: Netlify with Serverless Functions

## 📁 Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── studio/        # Audio studio components
│   │   ├── voice/         # Voice management
│   │   ├── auth/          # Authentication
│   │   ├── settings/      # User settings & billing
│   │   └── ui/            # Shared UI components
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript definitions
├── server/
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── usage.service.js    # Usage tracking
│   │   └── subscription.service.js # Subscription management
│   └── middleware/
│       ├── auth.js        # Authentication middleware
│       ├── stripe-webhook.js # Stripe webhook handling
│       └── usage-limits.js   # Usage limits enforcement
├── scripts/               # Utility scripts
└── netlify/               # Serverless functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- OpenRouter AI account
- Stripe account for payments
- Clerk account for authentication

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/audiomax.git
cd audiomax
```

2. Copy the environment example files:
```bash
cp .env.example .env
```

3. Configure environment variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
OPENROUTERAI_API_KEY=your_openrouter_api_key

# Google Cloud Text-to-Speech Credentials
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_AUTH_CODE=your_auth_code

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY=your_pro_monthly_price_id
STRIPE_PRICE_ID_PRO_YEARLY=your_pro_yearly_price_id
STRIPE_PRICE_ID_PREMIUM_MONTHLY=your_premium_monthly_price_id
STRIPE_PRICE_ID_PREMIUM_YEARLY=your_premium_yearly_price_id

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Stripe products and prices:
```bash
npm run setup-stripe
```

3. Start development server:
```bash
npm run dev
```

## 🏗 Building for Production

```bash
npm run build
```

The build command creates a production-ready build in the `dist` directory.

## 📦 Deployment

### Netlify Deployment

1. Configure environment variables in Netlify:
   - Navigate to Site Settings > Build & Deploy > Environment Variables
   - Add all required environment variables
   - Ensure VITE_ prefixed variables are exactly as shown
   - For GOOGLE_PRIVATE_KEY, preserve newline characters (\n)
   - Add all Stripe-related environment variables

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 14 (or higher)

3. Set up Stripe webhook:
   - Create a webhook in Stripe dashboard pointing to your Netlify function URL
   - Configure webhook to listen for these events:
     * customer.subscription.created
     * customer.subscription.updated
     * customer.subscription.deleted
     * customer.subscription.trial_will_end
     * invoice.payment_succeeded
     * invoice.payment_failed
     * payment_intent.succeeded
     * payment_intent.payment_failed
     * customer.created
     * customer.updated
   - Add the webhook secret to your environment variables
   - Test webhook with Stripe CLI

### Stripe Integration Features

- **Subscription Management**
  - Automatic subscription creation and updates
  - Trial period handling
  - Subscription cancellation and reactivation
  - Proration handling for plan changes

- **Payment Processing**
  - Secure payment handling
  - Failed payment recovery
  - Automatic retries
  - Payment method updates

- **Usage Tracking**
  - Real-time usage monitoring
  - Usage-based billing
  - Usage limits enforcement
  - Usage analytics and trends

- **Webhook Handling**
  - Robust webhook processing
  - Automatic retries for failed webhooks
  - Comprehensive event handling
  - Error recovery mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
