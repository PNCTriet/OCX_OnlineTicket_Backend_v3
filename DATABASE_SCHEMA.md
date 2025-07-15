# 🗄️ Database Schema Documentation - OCX Ticketing Platform

> **Multi-tenant ticketing system** với PostgreSQL + Prisma + Supabase  
> **Kiến trúc:** Role-based access control, Organization isolation, Event management

---

## 📊 Tổng Quan Hệ Thống

### 🎯 Mục Tiêu Thiết Kế
- **Multi-tenant:** Mỗi organization có dữ liệu riêng biệt
- **Scalable:** Hỗ trợ nhiều tổ chức, nhiều sự kiện đồng thời
- **Secure:** Role-based access control, data isolation
- **Audit Trail:** Tracking đầy đủ các hoạt động

### 🏗️ Kiến Trúc Database
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Users       │    │  Organizations   │    │     Events      │
│                 │    │                  │    │                 │
│ - supabase_id   │◄──►│ - name          │◄──►│ - title         │
│ - email         │    │ - description    │    │ - location      │
│ - role          │    │ - logo_url       │    │ - start_date    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Tickets       │    │     Orders       │    │   Payments      │
│                 │    │                  │    │                 │
│ - price         │    │ - total_amount   │    │ - amount        │
│ - total_qty     │    │ - status         │    │ - payment_method│
│ - sold_qty      │    │ - reserved_until │    │ - transaction_id│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  OrderItems     │    │  CheckinLogs     │    │   EmailLogs     │
│                 │    │                  │    │                 │
│ - quantity      │    │ - qr_code        │    │ - email_type    │
│ - price         │    │ - checked_in_at  │    │ - status        │
│ - qr_code       │    │ - notes          │    │ - sent_at       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔐 Authentication & Authorization

### 👥 User Management
```sql
model User {
  id          String   @id @default(cuid())
  supabase_id String   @unique  -- Link với Supabase Auth
  email       String   @unique
  first_name  String?
  last_name   String?
  avatar_url  String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

**Chức năng:**
- **Supabase Integration:** Mapping user từ Supabase Auth
- **Profile Management:** Thông tin cá nhân người dùng
- **Multi-organization:** Một user có thể thuộc nhiều organization

### 🏢 Organization Management
```sql
model Organization {
  id          String   @id @default(cuid())
  name        String
  description String?
  logo_url    String?
  website     String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

**Chức năng:**
- **Tenant Isolation:** Mỗi organization là một tenant riêng biệt
- **Brand Management:** Logo, website, description cho tổ chức
- **Event Ownership:** Tổ chức sở hữu các sự kiện

### 🔗 User-Organization Relationship
```sql
model UserOrganization {
  id             String   @id @default(cuid())
  user_id        String
  organization_id String
  role           UserRole @default(USER)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  @@unique([user_id, organization_id])
}
```

**Chức năng:**
- **Role Assignment:** USER, ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
- **Permission Control:** Kiểm soát quyền truy cập theo role
- **Many-to-Many:** User có thể thuộc nhiều organization với role khác nhau

---

## 🎫 Event & Ticket Management

### 📅 Event System
```sql
model Event {
  id             String      @id @default(cuid())
  organization_id String
  title          String
  description    String?
  location       String?
  start_date     DateTime
  end_date       DateTime
  banner_url     String?
  status         EventStatus @default(DRAFT)
  created_at     DateTime    @default(now())
  updated_at     DateTime    @updatedAt
}
```

**Chức năng:**
- **Event Creation:** Tạo sự kiện với thông tin chi tiết
- **Status Management:** DRAFT → PUBLISHED → CANCELLED
- **Media Support:** Banner image cho sự kiện
- **Organization Binding:** Event thuộc về organization cụ thể

### 🎟️ Ticket Management
```sql
model Ticket {
  id           String       @id @default(cuid())
  event_id     String
  name         String
  description  String?
  price        Decimal      @db.Decimal(10, 2)
  total_qty    Int
  sold_qty     Int          @default(0)
  sale_start   DateTime?
  sale_end     DateTime?
  status       TicketStatus @default(ACTIVE)
  created_at   DateTime     @default(now())
  updated_at   DateTime     @updatedAt
}
```

**Chức năng:**
- **Inventory Management:** Theo dõi số lượng vé tổng và đã bán
- **Pricing:** Giá vé với độ chính xác 2 chữ số thập phân
- **Sale Period:** Thời gian mở bán và kết thúc bán vé
- **Status Control:** ACTIVE → INACTIVE → SOLD_OUT

---

## 🛒 Order & Booking System

### 📋 Order Management
```sql
model Order {
  id             String      @id @default(cuid())
  user_id        String
  organization_id String
  event_id       String?
  total_amount   Decimal     @db.Decimal(10, 2)
  status         OrderStatus @default(PENDING)
  reserved_until DateTime?
  created_at     DateTime    @default(now())
  updated_at     DateTime    @updatedAt
}
```

**Chức năng:**
- **Booking Process:** Tạo đơn hàng với reservation system
- **Status Flow:** PENDING → RESERVED → PAID → CANCELLED/EXPIRED
- **Timeout Management:** `reserved_until` cho auto-cancel sau 15 phút
- **Multi-event Orders:** Một order có thể chứa vé từ nhiều event

### 📦 Order Items
```sql
model OrderItem {
  id        String  @id @default(cuid())
  order_id  String
  ticket_id String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  qr_code   String? -- URL to QR code image

  order  Order  @relation(fields: [order_id], references: [id], onDelete: Cascade)
  ticket Ticket @relation(fields: [ticket_id], references: [id])
}
```

**Chức năng:**
- **Line Items:** Chi tiết từng loại vé trong đơn hàng
- **QR Generation:** Mỗi order item có QR code riêng
- **Price Snapshot:** Lưu giá vé tại thời điểm mua
- **Quantity Tracking:** Số lượng vé cho từng loại

---

## 💳 Payment System

### 💰 Payment Processing
```sql
model Payment {
  id            String        @id @default(cuid())
  order_id      String
  amount        Decimal       @db.Decimal(10, 2)
  currency      String        @default("VND")
  payment_method String       -- "stripe", "momo", etc.
  status        PaymentStatus @default(PENDING)
  transaction_id String?      -- External payment provider transaction ID
  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt
}
```

**Chức năng:**
- **Multi-gateway:** Hỗ trợ Stripe, Momo, và các gateway khác
- **Transaction Tracking:** Lưu transaction ID từ payment provider
- **Status Management:** PENDING → SUCCESS/FAILED → REFUNDED
- **Currency Support:** Mặc định VND, có thể mở rộng

---

## ✅ Check-in System

### 📱 Check-in Logging
```sql
model CheckinLog {
  id        String   @id @default(cuid())
  order_id  String
  user_id   String
  qr_code   String
  checked_in_at DateTime @default(now())
  notes     String?

  order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

**Chức năng:**
- **QR Validation:** Kiểm tra QR code hợp lệ
- **Duplicate Prevention:** Tránh check-in trùng lặp
- **Audit Trail:** Ghi lại thời gian và người check-in
- **Notes Support:** Ghi chú cho check-in (nếu cần)

---

## 📧 Communication System

### 📨 Email Logging
```sql
model EmailLog {
  id        String   @id @default(cuid())
  user_id   String
  order_id  String?
  email_type String  -- "order_confirmation", "payment_success", "ticket_delivery"
  status    String   -- "sent", "failed", "pending"
  sent_at   DateTime @default(now())
  error     String?
}
```

**Chức năng:**
- **Email Tracking:** Theo dõi trạng thái gửi email
- **Type Classification:** Phân loại email theo mục đích
- **Error Handling:** Lưu lỗi nếu gửi thất bại
- **Retry Support:** Hỗ trợ gửi lại email

### 🔗 Webhook Logging
```sql
model WebhookLog {
  id           String   @id @default(cuid())
  organization_id String
  event_type   String   -- "order_created", "payment_completed", "checkin_completed"
  payload      String   -- JSON payload
  status       String   -- "sent", "failed", "pending"
  retry_count  Int      @default(0)
  sent_at      DateTime @default(now())
  error        String?
}
```

**Chức năng:**
- **Webhook Delivery:** Gửi webhook cho third-party systems
- **Retry Mechanism:** Tự động thử lại nếu gửi thất bại
- **Payload Storage:** Lưu payload để debug
- **Organization Scoped:** Webhook theo từng organization

---

## 🔄 Status Enums

### 👤 User Roles
```sql
enum UserRole {
  USER              -- Người dùng thường
  ADMIN_ORGANIZER   -- Admin tổ chức
  OWNER_ORGANIZER   -- Chủ sở hữu tổ chức
  SUPERADMIN        -- Super admin hệ thống
}
```

### 📅 Event Status
```sql
enum EventStatus {
  DRAFT      -- Bản nháp
  PUBLISHED  -- Đã xuất bản
  CANCELLED  -- Đã hủy
}
```

### 🎟️ Ticket Status
```sql
enum TicketStatus {
  ACTIVE    -- Đang bán
  INACTIVE  -- Tạm ngưng
  SOLD_OUT  -- Hết vé
}
```

### 📋 Order Status
```sql
enum OrderStatus {
  PENDING   -- Chờ xử lý
  RESERVED  -- Đã đặt chỗ
  PAID      -- Đã thanh toán
  CANCELLED -- Đã hủy
  EXPIRED   -- Hết hạn
}
```

### 💳 Payment Status
```sql
enum PaymentStatus {
  PENDING   -- Chờ thanh toán
  SUCCESS   -- Thanh toán thành công
  FAILED    -- Thanh toán thất bại
  REFUNDED  -- Đã hoàn tiền
}
```

---

## 🔒 Security & Data Isolation

### 🛡️ Multi-tenant Security
- **Organization Isolation:** Mọi dữ liệu đều gắn `organization_id`
- **RLS Policies:** Row Level Security trên Supabase
- **Role-based Access:** Kiểm soát quyền theo UserRole
- **Data Encryption:** Sensitive data được mã hóa

### 📊 Audit Trail
- **Created/Updated:** Timestamp cho mọi record
- **User Tracking:** Ghi lại user thực hiện action
- **Status History:** Theo dõi thay đổi trạng thái
- **Logging System:** Email, webhook, check-in logs

---

## 🚀 Performance & Scalability

### ⚡ Optimization Features
- **Indexing:** Primary keys, foreign keys, unique constraints
- **Cascade Deletes:** Tự động xóa related records
- **Decimal Precision:** Chính xác cho financial data
- **JSON Storage:** Flexible payload storage cho webhooks

### 📈 Scalability Considerations
- **Horizontal Scaling:** Có thể shard theo organization
- **Read Replicas:** Support cho read-heavy operations
- **Caching Strategy:** Redis cho session và cache
- **Queue System:** BullMQ cho background jobs

---

## 🔧 Migration & Deployment

### 📋 Database Migrations
```bash
# Generate migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy

# Reset development
npx prisma migrate reset
```

### 🐳 Environment Setup
```bash
# Development
DATABASE_URL="postgresql://localhost:5432/ticketing_dev"

# Production (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

---

## 📝 Notes & Best Practices

### ✅ Design Principles
- **Normalization:** Tránh data duplication
- **Consistency:** Foreign key constraints
- **Performance:** Proper indexing strategy
- **Security:** Multi-tenant isolation

### 🔄 Future Enhancements
- **Analytics Tables:** Pre-computed statistics
- **Audit Tables:** Change tracking
- **Soft Deletes:** Archive instead of delete
- **Partitioning:** Large table optimization

**🎯 Goal:** Scalable, secure, multi-tenant ticketing platform với full audit trail và real-time capabilities. 