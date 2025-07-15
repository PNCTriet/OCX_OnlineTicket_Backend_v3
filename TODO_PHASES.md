# 🧾 Backend Ticketing System - Todo List by Phases

> **Multi-tenant online ticketing system** với NestJS + Prisma + Supabase  
> **Mục tiêu:** API-first backend phục vụ mua vé, thanh toán, checkin, và dashboard thống kê

---

## 🚀 Phase 1: Project Setup & Authentication

### 📦 Initial Setup
- [ ] **Initialize NestJS project**
  - [ ] `nest new ocx-ticketing-backend`
  - [ ] Install dependencies: `@nestjs/swagger`, `@nestjs/config`, `@nestjs/bull`
  - [ ] Setup TypeScript config và ESLint

- [ ] **Database Setup**
  - [ ] Install Prisma: `npm install prisma @prisma/client`
  - [ ] Initialize Prisma: `npx prisma init`
  - [ ] Configure Supabase connection trong `prisma/schema.prisma`
  - [ ] Setup environment variables cho DATABASE_URL

- [ ] **Supabase Integration**
  - [ ] Create Supabase project
  - [ ] Setup database schema (users, organizations, user_organizations)
  - [ ] Configure RLS policies
  - [ ] Setup Supabase Auth

### 🔐 Authentication Module
- [ ] **Create auth module**
  - [ ] `nest g module auth`
  - [ ] `nest g service auth`
  - [ ] `nest g controller auth`

- [ ] **JWT Middleware**
  - [ ] Create JWT decode middleware
  - [ ] Extract user info từ Supabase JWT
  - [ ] Map `supabase_id` sang local user
  - [ ] Inject user context vào request

- [ ] **User Mapping**
  - [ ] Create users table với `supabase_id` field
  - [ ] Auto-create user khi login lần đầu
  - [ ] Sync user data từ Supabase Auth

---

## 🔐 Phase 2: Authorization & Role Management

### 👥 User Roles System
- [ ] **Define Role Enum**
  - [ ] `USER` - Người dùng thường
  - [ ] `ADMIN_ORGANIZER` - Admin tổ chức
  - [ ] `OWNER_ORGANIZER` - Chủ sở hữu tổ chức
  - [ ] `SUPERADMIN` - Super admin hệ thống

- [ ] **Organization Management**
  - [ ] Create organizations table
  - [ ] Create user_organizations junction table
  - [ ] Setup many-to-many relationship

### 🛡️ Authorization Guards
- [ ] **Create Guards**
  - [ ] `nest g guard roles`
  - [ ] `nest g guard organization`
  - [ ] Implement role-based access control

- [ ] **Custom Decorators**
  - [ ] `nest g decorator roles`
  - [ ] `nest g decorator current-user`
  - [ ] `nest g decorator organization`

- [ ] **Middleware Setup**
  - [ ] Organization context middleware
  - [ ] Role validation middleware
  - [ ] Multi-tenant isolation

---

## 🎫 Phase 3: Events & Tickets Management

### 📅 Events Module
- [ ] **Create events module**
  - [ ] `nest g module events`
  - [ ] `nest g service events`
  - [ ] `nest g controller events`

- [ ] **Events CRUD**
  - [ ] `GET /events` - List events (public)
  - [ ] `GET /events/:id` - Event details (public)
  - [ ] `POST /events` - Create event (admin only)
  - [ ] `PUT /events/:id` - Update event (admin only)
  - [ ] `DELETE /events/:id` - Delete event (admin only)

- [ ] **Event Schema**
  - [ ] Title, description, location
  - [ ] Start/end datetime
  - [ ] Banner image (Supabase Storage)
  - [ ] Organization relationship
  - [ ] Status (draft, published, cancelled)

### 🎟️ Tickets Module
- [ ] **Create tickets module**
  - [ ] `nest g module tickets`
  - [ ] `nest g service tickets`
  - [ ] `nest g controller tickets`

- [ ] **Tickets CRUD**
  - [ ] `GET /events/:id/tickets` - List tickets (public)
  - [ ] `POST /tickets` - Create ticket type (admin only)
  - [ ] `PUT /tickets/:id` - Update ticket (admin only)
  - [ ] `DELETE /tickets/:id` - Delete ticket (admin only)

- [ ] **Ticket Schema**
  - [ ] Name, description, price
  - [ ] Total quantity, sold quantity
  - [ ] Sale start/end datetime
  - [ ] Event relationship
  - [ ] Status (active, inactive, sold-out)

---

## 🧾 Phase 4: Orders & Booking System

### 📋 Orders Module
- [ ] **Create orders module**
  - [ ] `nest g module orders`
  - [ ] `nest g service orders`
  - [ ] `nest g controller orders`

- [ ] **Order Management**
  - [ ] `POST /orders` - Create order
  - [ ] `GET /orders/:id` - View order
  - [ ] `POST /orders/:id/cancel` - Cancel order
  - [ ] `GET /orders` - List user orders

- [ ] **Order Schema**
  - [ ] Order items (ticket_id, quantity, price)
  - [ ] Total amount, status
  - [ ] Reserved until (15 minutes)
  - [ ] User and organization relationship

### 🔒 Inventory Management
- [ ] **Stock Validation**
  - [ ] Check available quantity before booking
  - [ ] Use Prisma transactions to prevent oversell
  - [ ] Update sold quantity atomically

- [ ] **Reservation System**
  - [ ] Temporary hold tickets for 15 minutes
  - [ ] Auto-cancel expired reservations
  - [ ] Queue job for cleanup

---

## 💸 Phase 5: Payment Gateway Integration

### 💳 Payment Module
- [ ] **Create payments module**
  - [ ] `nest g module payments`
  - [ ] `nest g service payments`
  - [ ] `nest g controller payments`

- [ ] **Stripe Integration**
  - [ ] Install Stripe SDK
  - [ ] Setup payment intent creation
  - [ ] Handle payment confirmation
  - [ ] Webhook processing

- [ ] **Payment Flow**
  - [ ] `POST /orders/:id/pay` - Initiate payment
  - [ ] Create Stripe payment intent
  - [ ] Update order status on success
  - [ ] Handle payment failures

### 🔄 Payment Webhooks
- [ ] **Webhook Handler**
  - [ ] Verify Stripe webhook signature
  - [ ] Process payment success/failure
  - [ ] Update order status
  - [ ] Trigger email sending

---

## 📩 Phase 6: Email & QR Code Generation

### 📧 Email Service
- [ ] **Setup Email Queue**
  - [ ] Install BullMQ and Redis
  - [ ] Configure Resend/SendGrid
  - [ ] Create email templates

- [ ] **Email Triggers**
  - [ ] Order confirmation email
  - [ ] Payment success email
  - [ ] Ticket delivery email
  - [ ] QR code attachment

### 🎫 QR Code Generation
- [ ] **QR Code Module**
  - [ ] Install `node-qrcode`
  - [ ] Generate QR for each order item
  - [ ] Upload QR to Supabase Storage
  - [ ] Link QR to order item

- [ ] **QR Code Features**
  - [ ] Unique QR per ticket
  - [ ] Event and ticket info encoded
  - [ ] Expiration date included
  - [ ] Storage optimization

---

## ✅ Phase 7: Check-in System

### 📱 Check-in Module
- [ ] **Create checkin module**
  - [ ] `nest g module checkin`
  - [ ] `nest g service checkin`
  - [ ] `nest g controller checkin`

- [ ] **Check-in API**
  - [ ] `POST /checkin` - Process QR scan
  - [ ] Validate QR code
  - [ ] Check ticket validity
  - [ ] Prevent duplicate check-ins

- [ ] **Check-in Logic**
  - [ ] QR code validation
  - [ ] Ticket status verification
  - [ ] Event date/time validation
  - [ ] Check-in logging

### 📊 Check-in Logging
- [ ] **Logging System**
  - [ ] Create checkin_logs table
  - [ ] Record check-in attempts
  - [ ] Track successful/failed check-ins
  - [ ] Store check-in metadata

---

## 📊 Phase 8: Dashboard & Analytics

### 📈 Dashboard Module
- [ ] **Create dashboard module**
  - [ ] `nest g module dashboard`
  - [ ] `nest g service dashboard`
  - [ ] `nest g controller dashboard`

- [ ] **Analytics APIs**
  - [ ] `GET /dashboard/organization/:id` - Org overview
  - [ ] `GET /dashboard/events/:id` - Event stats
  - [ ] `GET /dashboard/revenue` - Revenue analytics
  - [ ] `GET /dashboard/checkins` - Check-in stats

- [ ] **Dashboard Metrics**
  - [ ] Total revenue, tickets sold
  - [ ] Conversion rates
  - [ ] Popular events/tickets
  - [ ] Check-in statistics

### 📋 Reporting Features
- [ ] **Export Functions**
  - [ ] CSV export for orders
  - [ ] PDF reports generation
  - [ ] Email report scheduling
  - [ ] Real-time data updates

---

## 🌐 Phase 9: Webhooks & Advanced Features

### 🔗 Webhook System
- [ ] **Webhook Module**
  - [ ] `nest g module webhook`
  - [ ] `nest g service webhook`
  - [ ] `nest g controller webhook`

- [ ] **Webhook Triggers**
  - [ ] Order created webhook
  - [ ] Payment completed webhook
  - [ ] Check-in completed webhook
  - [ ] Event status changes

- [ ] **Webhook Management**
  - [ ] Per-organization webhook URLs
  - [ ] Webhook retry mechanism
  - [ ] Webhook logging
  - [ ] Security validation

### 🔄 Queue & Background Jobs
- [ ] **BullMQ Setup**
  - [ ] Configure Redis connection
  - [ ] Setup queue processors
  - [ ] Implement retry logic
  - [ ] Monitor queue health

- [ ] **Background Jobs**
  - [ ] Email sending jobs
  - [ ] Webhook delivery jobs
  - [ ] Order cleanup jobs
  - [ ] Analytics calculation jobs

---

## 🧪 Phase 10: Testing & Documentation

### 🧪 Testing
- [ ] **Unit Tests**
  - [ ] Service layer tests
  - [ ] Controller tests
  - [ ] Guard tests
  - [ ] Utility function tests

- [ ] **Integration Tests**
  - [ ] API endpoint tests
  - [ ] Database integration tests
  - [ ] Payment flow tests
  - [ ] Email sending tests

### 📚 Documentation
- [ ] **API Documentation**
  - [ ] Setup Swagger/OpenAPI
  - [ ] Document all endpoints
  - [ ] Add request/response examples
  - [ ] Include authentication info

- [ ] **Code Documentation**
  - [ ] JSDoc comments
  - [ ] README updates
  - [ ] Deployment guide
  - [ ] Environment setup guide

---

## 🚀 Phase 11: Deployment & Production

### 🐳 Containerization
- [ ] **Docker Setup**
  - [ ] Create Dockerfile
  - [ ] Setup docker-compose
  - [ ] Configure production environment
  - [ ] Health check endpoints

- [ ] **Environment Management**
  - [ ] Production environment variables
  - [ ] Database migration scripts
  - [ ] SSL certificate setup
  - [ ] Domain configuration

### 📊 Monitoring & Logging
- [ ] **Application Monitoring**
  - [ ] Setup Sentry for error tracking
  - [ ] Configure application logs
  - [ ] Performance monitoring
  - [ ] Database monitoring

- [ ] **Health Checks**
  - [ ] Database connectivity
  - [ ] Redis connection
  - [ ] External service status
  - [ ] Queue health monitoring

---

## 📋 Additional Tasks

### 🔧 Development Tools
- [ ] **Development Setup**
  - [ ] Hot reload configuration
  - [ ] Debug configuration
  - [ ] Code formatting (Prettier)
  - [ ] Git hooks (husky)

### 🔒 Security Enhancements
- [ ] **Security Measures**
  - [ ] Rate limiting
  - [ ] Input validation
  - [ ] SQL injection prevention
  - [ ] CORS configuration

### 🎯 Performance Optimization
- [ ] **Performance**
  - [ ] Database query optimization
  - [ ] Caching strategy
  - [ ] API response optimization
  - [ ] Image optimization

---

## 📝 Notes

- **Priority Order:** Follow phases sequentially for best results
- **Testing:** Write tests alongside development
- **Documentation:** Keep documentation updated as you build
- **Security:** Implement security measures from the start
- **Scalability:** Design with multi-tenant architecture in mind

**🎯 Goal:** Complete MVP by Phase 6, full system by Phase 11 