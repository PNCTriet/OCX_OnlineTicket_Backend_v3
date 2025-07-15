# 🧾 OCX Ticketing Backend

> **Multi-tenant online ticketing system** với NestJS + Prisma + Supabase  
> **API-first backend** phục vụ mua vé, thanh toán, checkin, và dashboard thống kê

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
  <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## 📋 Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

**OCX Ticketing Backend** là hệ thống backend cho nền tảng bán vé online với kiến trúc multi-tenant, hỗ trợ:

- 🎫 **Event Management** - Quản lý sự kiện và vé
- 💳 **Payment Processing** - Xử lý thanh toán (Stripe, Momo)
- ✅ **Check-in System** - Hệ thống check-in bằng QR code
- 📧 **Email Automation** - Tự động gửi email và QR code
- 📊 **Analytics Dashboard** - Thống kê và báo cáo
- 🔐 **Multi-tenant Security** - Bảo mật và phân quyền theo tổ chức

## 🚀 Quick Start

### 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd ocx-ticketing-backend

# Install dependencies
npm install
```

### 🔧 Environment Setup

#### 1. Create Environment File

```bash
# Copy environment template
cp .env.example .env
```

#### 2. Configure Supabase

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down your project reference ID

2. **Get Database Credentials:**
   - Go to Settings > Database
   - Copy the connection string
   - Get your database password

3. **Get API Keys:**
   - Go to Settings > API
   - Copy the `anon` key and `service_role` key

4. **Update .env file:**
```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
JWT_SECRET="[YOUR-JWT-SECRET]"
```

#### 3. Configure Payment Gateway (Optional)

**Stripe Setup:**
```bash
# Get from Stripe Dashboard
STRIPE_SECRET_KEY="sk_test_[YOUR-STRIPE-SECRET-KEY]"
STRIPE_PUBLISHABLE_KEY="pk_test_[YOUR-STRIPE-PUBLISHABLE-KEY]"
STRIPE_WEBHOOK_SECRET="whsec_[YOUR-STRIPE-WEBHOOK-SECRET]"
```

**Momo Setup:**
```bash
# Get from Momo Developer Portal
MOMO_SECRET_KEY="[YOUR-MOMO-SECRET-KEY]"
MOMO_ACCESS_KEY="[YOUR-MOMO-ACCESS-KEY]"
MOMO_PARTNER_CODE="[YOUR-MOMO-PARTNER-CODE]"
```

#### 4. Configure Email Service (Optional)

**Resend (Recommended):**
```bash
# Get from resend.com
RESEND_API_KEY="re_[YOUR-RESEND-API-KEY]"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="OCX Ticketing"
```

**SendGrid (Alternative):**
```bash
# Get from SendGrid Dashboard
SENDGRID_API_KEY="SG.[YOUR-SENDGRID-API-KEY]"
```

#### 5. Configure Redis (for Background Jobs)

```bash
# Local Redis
REDIS_URL="redis://localhost:6379"

# Or Cloud Redis
REDIS_URL="redis://[YOUR-REDIS-HOST]:[PORT]"
REDIS_PASSWORD="[YOUR-REDIS-PASSWORD]"
```

### 🗄️ Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npm run seed
```

### 🏃‍♂️ Running the App

```bash
# Development
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 API Documentation

Once the app is running, you can access:

- **Swagger UI:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/health`

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── auth/               # Authentication & Authorization
├── users/              # User management
├── organizations/      # Organization management
├── events/             # Event CRUD operations
├── tickets/            # Ticket management
├── orders/             # Order processing
├── payments/           # Payment gateway integration
├── checkin/            # Check-in system
├── emails/             # Email automation
├── webhooks/           # Webhook handling
├── dashboard/          # Analytics & reporting
├── common/             # Shared utilities, guards, decorators
└── main.ts             # Application entry point
```

## 🔐 Authentication Flow

1. **Frontend Login:** User logs in via Supabase Auth
2. **JWT Token:** Frontend sends JWT token in Authorization header
3. **Token Validation:** Backend validates token with Supabase
4. **User Mapping:** Maps `supabase_id` to local user record
5. **Role Assignment:** Assigns user role and organization access
6. **Request Context:** Injects user context into request

## 🏢 Multi-tenant Architecture

- **Organization Isolation:** All data is scoped to organization
- **Role-based Access:** 4 roles: USER, ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
- **Data Security:** Row Level Security (RLS) policies on Supabase
- **Audit Trail:** Complete logging of all operations

## 💳 Payment Integration

### Supported Gateways:
- **Stripe:** Credit cards, digital wallets
- **Momo:** Vietnamese mobile payment
- **Extensible:** Easy to add more gateways

### Payment Flow:
1. Create order with reservation
2. Generate payment intent
3. Process payment via gateway
4. Update order status
5. Send confirmation email with QR code

## ✅ Check-in System

### QR Code Generation:
- Unique QR code per ticket
- Encoded with order and ticket information
- Stored in Supabase Storage
- Attached to confirmation emails

### Check-in Process:
1. Scan QR code with mobile app
2. Validate ticket authenticity
3. Check event date and time
4. Prevent duplicate check-ins
5. Log check-in activity

## 📧 Email Automation

### Email Types:
- **Order Confirmation:** After successful booking
- **Payment Success:** After payment completion
- **Ticket Delivery:** With QR code attachment
- **Event Reminders:** Before event date

### Email Providers:
- **Resend:** Recommended for high deliverability
- **SendGrid:** Alternative option
- **Queue System:** BullMQ for reliable delivery

## 📊 Analytics & Reporting

### Dashboard Features:
- Revenue analytics
- Ticket sales statistics
- Event performance metrics
- Check-in statistics
- User engagement data

### Export Options:
- CSV export for orders
- PDF reports generation
- Email report scheduling

## 🔧 Development

### Prerequisites:
- Node.js 18+
- PostgreSQL (via Supabase)
- Redis (for background jobs)

### Development Commands:
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint
```

### Environment Variables:
See `.env.example` for complete list of required environment variables.

## 🚀 Deployment

### Production Checklist:
- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Deployment Options:
- **Vercel:** Serverless deployment
- **Railway:** Easy container deployment
- **DigitalOcean:** Traditional VPS
- **AWS/GCP:** Cloud infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [NestJS Docs](https://docs.nestjs.com/)
- **Discord:** [NestJS Discord](https://discord.gg/G7Qnnhy)
- **Issues:** [GitHub Issues](https://github.com/your-username/ocx-ticketing-backend/issues)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Stripe](https://stripe.com/) - Payment processing platform

---

**🎯 Goal:** Build a scalable, secure, and feature-rich ticketing platform for modern event management.
