# 🧾 Backend Ticketing System – Technical Plan

> Phiên bản mới nhất: Tách backend (NestJS + Prisma) phục vụ frontend Next.js  
> Mục tiêu: API-first backend phục vụ mua vé, thanh toán, checkin, và dashboard thống kê.

---

## 🌐 Tech Stack Overview

| Thành phần         | Công nghệ chọn             | Ghi chú triển khai                                 |
|-------------------|----------------------------|----------------------------------------------------|
| **Backend**        | NestJS                     | RESTful, modular, scalable                         |
| **Database**       | Supabase PostgreSQL        | Hệ quản trị cơ sở dữ liệu cloud                    |
| **ORM**            | Prisma                     | Quản lý schema, migrations                         |
| **Auth**           | Supabase Auth              | FE login, backend mapping qua `supabase_id`        |
| **Queue**          | BullMQ (Redis)             | Gửi mail, retry webhook                            |
| **Email**          | Resend                     | Gửi mã vé điện tử, QR                              |
| **QR Code**        | node-qrcode                | Sinh mã QR gắn vào vé                              |
| **Realtime**       | Socket.IO hoặc Supabase    | Phục vụ checkin realtime                           |
| **Docs**           | Swagger (nestjs/swagger)   | Tự động sinh tài liệu API                          |

---

## 📦 Folder Structure

```
src/
├── auth/                // Decode JWT từ Supabase
├── users/               // Thông tin người dùng
├── organizations/       // Tổ chức sự kiện
├── events/              // CRUD sự kiện
├── tickets/             // CRUD vé sự kiện
├── orders/              // Đặt vé
├── payments/            // Thanh toán
├── checkin/             // Check-in bằng QR
├── promos/              // Mã khuyến mãi
├── emails/              // Queue gửi email
├── webhook/             // Log và gửi webhook
├── dashboard/           // Thống kê & báo cáo
├── common/              // DTO, Guard, Decorator dùng chung
└── main.ts
```

---

## 🚀 Lộ Trình 9 Phase

### ✅ Phase 1 – Authentication
- Supabase FE login
- Middleware decode JWT
- Map user & role từ local DB (`users`, `user_organizations`)

---

### 🔐 Phase 2 – Authorization
- Enum roles: `USER`, `ADMIN_ORGANIZER`, `OWNER_ORGANIZER`, `SUPERADMIN`
- Guard kiểm tra phân quyền theo từng API
- Decorator `@Roles()` áp dụng cho controller

---

### 🎫 Phase 3 – Event & Ticket
- Module `events`:
  - `GET /events`, `GET /events/:id`
  - `POST /events`, `PUT`, `DELETE` (admin tổ chức)
- Module `tickets`:
  - Gắn với `event_id`, CRUD vé theo loại
  - Quản lý số lượng `total`, `sold`, thời gian mở bán

---

### 🧾 Phase 4 – Order & Booking
- `POST /orders`:
  - Tạo đơn hàng, kiểm tra tồn kho
  - Tạm giữ vé trong 15 phút bằng `reserved_until`
- `GET /orders/:id`: Xem đơn
- `POST /orders/:id/cancel`: Huỷ đơn
- `reserved_until` timeout sẽ huỷ đơn tự động (queue/cron)

---

### 💸 Phase 5 – Payment Gateway
- Module `payments`
  - Stripe: test đơn giản
  - Momo: tích hợp sau
- Webhook update đơn trạng thái `paid`
- `POST /orders/:id/pay` → đánh dấu thanh toán thành công

---

### 📩 Phase 6 – Email & QR
- Tạo QR từ `order_item`
- Upload QR lên Supabase Storage
- Queue gửi mail bằng BullMQ
- Log lại `email_logs`

---

### ✅ Phase 7 – Check-in
- `POST /checkin`:
  - Nhận QR từ app checkin
  - Kiểm tra hợp lệ, chưa check, đúng sự kiện
- Log vào `checkin_logs`

---

### 📊 Phase 8 – Dashboard
- Tổng quan:
  - Doanh thu, vé bán, chuyển đổi
- Tổ chức:
  - Thống kê theo sự kiện, khung giờ
- API:
  - `/dashboard/organization/:id`

---

### 🌐 Phase 9 – Webhook & Retry
- Ghi log khi:
  - Đơn hàng tạo
  - Thanh toán xong
  - Checkin thành công
- Gửi webhook theo `organization`
- Retry tự động nếu lỗi (BullMQ)

---

## 🧪 API Core (Public)
| Route | Method | Mô tả |
|-------|--------|------|
| `/events` | `GET` | Danh sách sự kiện |
| `/events/:id` | `GET` | Chi tiết sự kiện |
| `/events/:id/tickets` | `GET` | Vé của sự kiện |
| `/orders` | `POST` | Tạo đơn hàng |
| `/orders/:id` | `GET` | Xem đơn |
| `/orders/:id/pay` | `POST` | Thanh toán đơn |
| `/checkin` | `POST` | Kiểm tra QR check-in |

---

## 🧠 Dev Tips

- Dùng Prisma `transaction()` khi tạo order để tránh oversell
- Check `ticket.total - ticket.sold >= quantity`
- Guard tổ chức kiểm tra theo `organization_id`
- Sử dụng `nestjs/swagger` để generate API docs
- CORS config cho frontend Next.js domain

---

## ⏭️ Next Step

- [ ] Init NestJS + Prisma
- [ ] Tạo middleware decode JWT → map role
- [ ] Xây module `events`, `tickets`, `orders`
- [ ] Kết nối frontend Next.js để call thử API đặt vé

---

**📌 Mọi mô-đun cần đều đã lên plan, chỉ cần từng bước build đúng theo phase là launch cực nhanh.  
Nếu cần source starter NestJS chuẩn production hoặc từng module generate sẵn – ping tôi.**