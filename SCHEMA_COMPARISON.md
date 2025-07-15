# 🔄 Schema Comparison: ticketing_db_schema.txt vs schema.prisma

> **So sánh chi tiết** giữa schema cũ và schema mới được cập nhật

---

## 📊 Tổng Quan Thay Đổi

### ✅ **Những gì được GIỮ LẠI từ schema cũ:**
- Core models: User, Organization, Event, Ticket, Order, Payment
- Basic relationships và foreign keys
- Timestamp fields (created_at, updated_at)

### 🔄 **Những gì được THAY ĐỔI:**

#### 1. **ID Strategy**
```diff
# Schema cũ (ticketing_db_schema.txt)
model User {
  id    Int    @id @default(autoincrement())  # Auto-increment integer
}

# Schema mới (schema.prisma)  
model User {
  id    String @id @default(cuid())           # CUID string
}
```

#### 2. **User Model**
```diff
# Schema cũ
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  name            String?
  role            UserRole @default(USER)
  is_verified     Boolean  @default(false)
  supabase_id     String?  @unique
  phone           String?
  avatar_url      String?
}

# Schema mới
model User {
  id          String   @id @default(cuid())
  supabase_id String   @unique
  email       String   @unique
  first_name  String?
  last_name   String?
  avatar_url  String?
}
```

**Thay đổi:**
- ✅ **Bỏ:** `name`, `is_verified`, `phone` fields
- ✅ **Thêm:** `first_name`, `last_name` fields
- ✅ **Đổi:** ID từ `Int` sang `String` (CUID)

#### 3. **Organization Model**
```diff
# Schema cũ
model Organization {
  id            Int      @id @default(autoincrement())
  name          String
  contact_email String?
  phone         String?
  address       String?
}

# Schema mới
model Organization {
  id          String   @id @default(cuid())
  name        String
  description String?
  logo_url    String?
  website     String?
}
```

**Thay đổi:**
- ✅ **Bỏ:** `contact_email`, `phone`, `address`
- ✅ **Thêm:** `description`, `logo_url`, `website`
- ✅ **Đổi:** ID từ `Int` sang `String` (CUID)

#### 4. **Event Model**
```diff
# Schema cũ
model Event {
  id              Int      @id @default(autoincrement())
  organization_id Int
  name            String
  description     String?
  date            DateTime
  location        String?
}

# Schema mới
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
}
```

**Thay đổi:**
- ✅ **Bỏ:** `date` field
- ✅ **Thêm:** `title`, `start_date`, `end_date`, `banner_url`, `status`
- ✅ **Đổi:** `name` → `title`, ID từ `Int` sang `String`

#### 5. **Ticket Model**
```diff
# Schema cũ
model Ticket {
  id              Int      @id @default(autoincrement())
  event_id        Int
  name            String
  price           Decimal
  type            String
  total           Int
  sold            Int
  start_sale_date DateTime?
  end_sale_date   DateTime?
  is_active       Boolean  @default(true)
}

# Schema mới
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
}
```

**Thay đổi:**
- ✅ **Bỏ:** `type`, `is_active` fields
- ✅ **Thêm:** `description`, `status` enum
- ✅ **Đổi:** `total` → `total_qty`, `sold` → `sold_qty`, `start_sale_date` → `sale_start`, `end_sale_date` → `sale_end`
- ✅ **Cải thiện:** `price` có precision `@db.Decimal(10, 2)`

#### 6. **Order Model**
```diff
# Schema cũ
model Order {
  id             Int          @id @default(autoincrement())
  user_id        String?
  status         OrderStatus
  reserved_until DateTime?
  expired_at     DateTime?
  payment_method String
  amount         Decimal
}

# Schema mới
model Order {
  id             String      @id @default(cuid())
  user_id        String
  organization_id String
  event_id       String?
  total_amount   Decimal     @db.Decimal(10, 2)
  status         OrderStatus @default(PENDING)
  reserved_until DateTime?
}
```

**Thay đổi:**
- ✅ **Bỏ:** `expired_at`, `payment_method` fields
- ✅ **Thêm:** `organization_id`, `event_id`, `total_amount`
- ✅ **Đổi:** `amount` → `total_amount`, `user_id` từ optional → required
- ✅ **Cải thiện:** `amount` có precision `@db.Decimal(10, 2)`

---

## 🆕 **Những Model MỚI được thêm vào:**

### 1. **PromoCode & OrderPromo**
```sql
model PromoCode {
  id              Int      @id @default(autoincrement())
  code            String   @unique
  description     String?
  discount_type   String
  discount_value  Decimal
  max_uses        Int      @default(1)
  uses            Int      @default(0)
  valid_from      DateTime?
  valid_until     DateTime?
  is_active       Boolean  @default(true)
}

model OrderPromo {
  id               Int       @id @default(autoincrement())
  order_id         Int
  promo_code_id    Int
  discount_applied Decimal
}
```

### 2. **ReferralCode**
```sql
model ReferralCode {
  id         Int      @id @default(autoincrement())
  user_id    String
  code       String   @unique
  created_at DateTime @default(now())
  updated_at DateTime @default(now())
}
```

### 3. **TrackingVisit**
```sql
model TrackingVisit {
  id           Int      @id @default(autoincrement())
  user_id      String?
  event_id     Int
  utm_source   String?
  utm_medium   String?
  utm_campaign String?
  utm_content  String?
  referrer_url String?
  landing_page String?
}
```

### 4. **WebhookSubscription**
```sql
model WebhookSubscription {
  id              Int      @id @default(autoincrement())
  organization_id Int
  target_url      String
  event_type      String
  is_active       Boolean  @default(true)
}
```

### 5. **EventSetting**
```sql
model EventSetting {
  id            Int      @id @default(autoincrement())
  event_id      Int
  setting_key   String
  setting_value String
}
```

### 6. **Image & ImageLink**
```sql
model Image {
  id           Int      @id @default(autoincrement())
  file_path    String
  file_name    String?
  file_type    String?
  file_size    Int?
  alt_text     String?
  uploaded_by  String
}

model ImageLink {
  id              Int      @id @default(autoincrement())
  image_id        Int
  entity_type     String
  entity_id       Int
  organization_id Int?
  event_id        Int?
  usage_type      String
}
```

---

## 🗑️ **Những Model bị LOẠI BỎ:**

### ❌ **Bỏ hoàn toàn:**
- `PromoCode` và `OrderPromo` (có thể thêm lại sau)
- `ReferralCode` (có thể thêm lại sau)
- `TrackingVisit` (analytics feature)
- `WebhookSubscription` (webhook management)
- `EventSetting` (flexible settings)
- `Image` và `ImageLink` (file management)

---

## 🔄 **Lý Do Thay Đổi:**

### 1. **ID Strategy**
- **Từ:** Auto-increment integers
- **Sang:** CUID strings
- **Lý do:** Better cho distributed systems, no sequential guessing

### 2. **Simplification**
- **Bỏ:** Complex features (promo codes, tracking, webhooks)
- **Giữ:** Core ticketing functionality
- **Lý do:** Focus on MVP, add features incrementally

### 3. **Better Naming**
- **Từ:** Generic names (`name`, `date`)
- **Sang:** Specific names (`title`, `start_date`, `end_date`)
- **Lý do:** More descriptive và clear

### 4. **Enhanced Relationships**
- **Thêm:** `organization_id` vào Order
- **Cải thiện:** Multi-tenant isolation
- **Lý do:** Better data isolation

---

## 📝 **Kết Luận:**

### ✅ **Schema mới TỐT HƠN vì:**
1. **Simpler:** Focus vào core features
2. **Better IDs:** CUID cho distributed systems
3. **Clearer naming:** More descriptive field names
4. **Better isolation:** Multi-tenant architecture
5. **Enhanced precision:** Decimal precision cho financial data

### 🔄 **Có thể thêm lại sau:**
- Promo codes
- Referral system
- Analytics tracking
- Webhook management
- File management
- Event settings

**🎯 Strategy:** Start simple, add complexity incrementally based on actual needs. 