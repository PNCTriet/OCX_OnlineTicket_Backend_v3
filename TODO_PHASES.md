# 🧾 Backend Ticketing System - Todo List by Phases

> **Multi-tenant online ticketing system** với NestJS + Prisma + Supabase  
> **Mục tiêu:** API-first backend phục vụ mua vé, thanh toán, checkin, và dashboard thống kê

---

## 🚀 Phase 1: Project Setup & Authentication
- [x] Khởi tạo project NestJS, cài đặt Prisma, Supabase, cấu hình env
- [x] Thiết lập schema, migration, kết nối database
- [x] Tích hợp Supabase Auth, tạo Auth module, JWT guard
- [x] Xây dựng API: `/auth/register`, `/auth/login`, `/auth/me`
- [x] Viết tài liệu API (API_DOCUMENTATION.md)
- [x] Sửa lỗi JWT authentication và mapping user local

---

## 🔐 Phase 2: Authorization & User/Organization
- [x] Enum roles: USER, ADMIN_ORGANIZER, OWNER_ORGANIZER, SUPERADMIN
- [x] Guard kiểm tra phân quyền theo từng API
- [x] Decorator `@Roles()` cho controller
- [x] Module users: CRUD user, mapping supabase_id
- [x] Module organizations: CRUD tổ chức, phân quyền
- [x] API: `/users`, `/organizations`, `/user-organizations`
- [x] Thêm `@ApiBearerAuth()` cho tất cả protected endpoints

---

## 🎫 Phase 3: Event & Ticket Management
- [x] Module events: CRUD sự kiện
  - [x] API: `GET /events`, `GET /events/:id`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
- [x] Module tickets: CRUD vé sự kiện
  - [x] API: `GET /tickets`, `GET /tickets/:id`, `POST /tickets`, `PUT /tickets/:id`, `DELETE /tickets/:id`, `GET /tickets/event/:event_id`
- [x] Quản lý số lượng vé, thời gian mở bán, trạng thái vé

---

## 🧾 Phase 4: Order & Booking
- [x] Module orders: tạo đơn hàng, kiểm tra tồn kho
  - [x] API: `POST /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `GET /orders`
- [x] Tạm giữ vé (`reserved_until`), huỷ đơn tự động nếu timeout
- [x] Quản lý trạng thái đơn: PENDING, RESERVED, PAID, CANCELLED, EXPIRED
- [x] Logic nghiệp vụ: kiểm tra tồn kho, transaction, hoàn trả vé khi huỷ
- [ ] **TODO:** Implement scheduled task để tự động chuyển PENDING → EXPIRED sau 15 phút
- [ ] **TODO:** Thêm cron job hoặc BullMQ queue để xử lý order expiration

---

## 💸 Phase 5: Payment Gateway Integration
- [ ] Module payments: tích hợp Stripe, Momo
  - [ ] API: `POST /orders/:id/pay`, webhook cập nhật trạng thái
- [ ] Xử lý thanh toán, cập nhật đơn hàng khi thành công
- [ ] Lưu log giao dịch, trạng thái payment

---

## 📩 Phase 6: Email & QR Automation
- [ ] Sinh QR code cho từng vé (order_item)
- [ ] Upload QR lên Supabase Storage
- [ ] Queue gửi email xác nhận, gửi vé, nhắc sự kiện
- [ ] Module email_logs: lưu log gửi mail

---

## ✅ Phase 7: Check-in System
- [ ] Module checkin: xác thực QR, ghi log checkin
  - [ ] API: `POST /checkin`
- [ ] Kiểm tra hợp lệ, chống checkin trùng, đúng sự kiện
- [ ] Log vào checkin_logs

---

## 📊 Phase 8: Dashboard & Analytics
- [x] Module dashboard: tổng quan doanh thu, vé bán, hiệu suất sự kiện
  - [x] API: `/dashboard/system`, `/dashboard/organization/:id`, `/dashboard/event/:id`
- [x] Thống kê theo tổ chức, sự kiện, khung giờ (nâng cao)
- [x] Export PDF báo cáo dashboard tổ chức
  - [x] API: `/dashboard/organization/:id/export/pdf`
- [x] Export CSV, gửi báo cáo qua email
  - [x] API: `/dashboard/organization/:id/export/csv`
  - [x] API: `/dashboard/organization/:id/send-report`

---

## 🌐 Phase 9: Webhook & Retry
- [ ] Module webhook_logs: ghi log khi đơn hàng tạo, thanh toán, checkin
- [ ] Gửi webhook cho tổ chức, retry tự động nếu lỗi (BullMQ)
- [ ] API: `/webhooks`

---

## 🛠️ Phase 10: DevOps, Testing, Documentation
- [x] Tích hợp Swagger cho API docs
- [x] Chuẩn hoá README, tài liệu API
- [ ] Viết unit test, e2e test cho các module chính
- [ ] Checklist production: env, SSL, domain, monitoring, backup

---

## 🔧 **CURRENT FOCUS - Cần làm ngay:**

### 1. **Order Expiration System** (Ưu tiên cao)
- [ ] Tạo scheduled task để tự động chuyển PENDING → EXPIRED
- [ ] Implement cron job hoặc BullMQ queue
- [ ] Test logic expiration với order thực tế

### 2. **Payment Integration** (Ưu tiên trung bình)
- [ ] Tích hợp Stripe payment gateway
- [ ] Implement webhook để cập nhật order status
- [ ] Test payment flow end-to-end

### 3. **QR Code Generation** (Ưu tiên thấp)
- [ ] Sinh QR code cho order items
- [ ] Upload lên Supabase Storage
- [ ] Attach vào confirmation email

---

**📊 Progress Summary:**
- ✅ **Completed:** 7/10 phases (70%)
- 🔄 **In Progress:** Order expiration system
- ⏳ **Pending:** Payment, QR, Check-in, Webhook, Testing

**🎯 Next Milestone:** Hoàn thành order expiration system để đảm bảo business logic hoàn chỉnh. 