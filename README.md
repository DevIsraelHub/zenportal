# ZenPortal - Modern Customer Portal

A production-ready customer portal built with Next.js, Auth0, Stripe, and MongoDB. Features seamless authentication, subscription management, billing, and usage analytics.

![ZenPortal](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Auth0](https://img.shields.io/badge/Auth0-Enterprise-orange?style=for-the-badge&logo=auth0)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

## ✨ Features

### 🔐 Authentication & Security
- **Auth0 Integration** - Enterprise-grade authentication
- **Protected Routes** - Middleware-based route protection
- **Session Management** - Secure user sessions
- **SSO Support** - Single sign-on capabilities

### 💳 Subscription Management
- **Multi-Tier Plans** - Free, Starter, Core, Advanced, Max
- **Stripe Integration** - Secure payment processing
- **Billing Portal** - Self-service billing management
- **Webhook Handling** - Real-time subscription updates
- **Trial Management** - Free trial support

### 📊 Usage Analytics
- **Real-time Tracking** - Monitor API usage and limits
- **Dashboard Analytics** - Visual usage statistics
- **Plan Limits** - Automatic usage enforcement
- **Export Capabilities** - Data export functionality

### 🎨 Modern UI/UX
- **Shadcn/UI Components** - Beautiful, accessible components
- **Dark/Light Mode** - Theme switching support
- **Responsive Design** - Mobile-first approach
- **Framer Motion** - Smooth animations
- **Toast Notifications** - User feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Auth0 account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zenportal.git
   cd zenportal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Auth0 Configuration
   AUTH0_SECRET=your-auth0-secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret

   # Database
   DATABASE_URL=mongodb://localhost:27017/zenportal

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Stripe Price IDs
   NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_CORE_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_MAX_PRICE_ID=price_...
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
zenportal/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout
│   │   ├── billing/       # Billing portal
│   │   └── stripe/        # Stripe webhooks
│   ├── dashboard/         # Dashboard pages
│   │   ├── billing/       # Billing management
│   │   ├── usage/         # Usage analytics
│   │   └── profile/       # User profile
│   ├── auth/              # Auth0 routes
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   └── ui/               # Shadcn/UI components
├── lib/                   # Utility libraries
│   ├── auth0.ts          # Auth0 configuration
│   ├── stripe.ts         # Stripe configuration
│   ├── prisma.ts         # Database client
│   └── subscription.ts   # Subscription utilities
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── spec/                 # Specification files
│   ├── authentication.spec.yaml
│   ├── subscription-management.spec.yaml
│   ├── usage-analytics.spec.yaml
│   └── zenportal-complete.spec.yaml
└── __tests__/            # Test files
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes comprehensive tests for:
- UI Components (Button, Card)
- Authentication flows
- Subscription management
- API endpoints

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:
- Auth0 production credentials
- MongoDB production connection string
- Stripe production keys
- Webhook endpoints configured

## 📋 API Endpoints

### Authentication
- `GET /auth/login` - Initiate login
- `GET /auth/logout` - Logout user
- `GET /auth/callback` - Auth0 callback

### Subscription Management
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Create billing portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### User Management
- `GET /api/user` - Get user data
- `POST /api/user` - Update user data

## 🔧 Configuration

### Auth0 Setup
1. Create Auth0 application
2. Configure callback URLs
3. Set up user metadata
4. Configure social connections

### Stripe Setup
1. Create Stripe products and prices
2. Configure webhook endpoints
3. Set up billing portal
4. Test payment flows

### Database Schema
The application uses MongoDB with Prisma ORM:
- **User** - User profiles and authentication
- **Subscription** - Subscription plans and status
- **Usage** - Usage tracking and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the specification files in `/spec`

## 🎯 Roadmap

- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Email notifications
- [ ] Mobile app integration
- [ ] White-label customization

---

Built with ❤️ using Next.js, Auth0, Stripe, and MongoDB
